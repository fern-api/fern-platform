import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { sealData, unsealData } from "iron-session";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { parse, tokensToRegexp } from "path-to-regexp";
import { AccessToken, AuthkitMiddlewareAuth, NoUserInfo, Session, UserInfo } from "./interfaces";
import { withSecureCookie } from "./withSecure";
import { getAuthorizationUrl, getJwtSecretKey, getWorkOSClientId, workos } from "./workos";

const sessionHeaderName = "x-workos-session";
const middlewareHeaderName = "x-workos-middleware";
const redirectUriHeaderName = "x-redirect-uri";

const JWKS = createRemoteJWKSet(new URL(workos.userManagement.getJwksUrl(getWorkOSClientId())));

async function encryptSession(session: Session): Promise<string> {
    return sealData(session, { password: getJwtSecretKey() });
}

async function updateSession(
    request: NextRequest,
    debug: boolean,
    middlewareAuth: AuthkitMiddlewareAuth,
    redirectUri: string,
): Promise<NextResponse> {
    if (!redirectUri) {
        throw new Error("Missing redirect URI");
    }

    const session = await getSessionFromCookie();
    const newRequestHeaders = new Headers(request.headers);

    // We store the current request url in a custom header, so we can always have access to it
    // This is because on hard navigations we don't have access to `next-url` but need to get the current
    // `pathname` to be able to return the users where they came from before sign-in
    newRequestHeaders.set("x-url", request.url);

    // Record that the request was routed through the middleware so we can check later for DX purposes
    newRequestHeaders.set(middlewareHeaderName, "true");
    newRequestHeaders.set(redirectUriHeaderName, redirectUri);
    const url = new URL(redirectUri);

    newRequestHeaders.delete(sessionHeaderName);

    if (
        middlewareAuth.enabled &&
        url.pathname === request.nextUrl.pathname &&
        !middlewareAuth.unauthenticatedPaths.includes(url.pathname)
    ) {
        // In the case where:
        // - We're using middleware auth mode
        // - The redirect URI is in the middleware matcher
        // - The redirect URI isn't in the unauthenticatedPaths array
        //
        // then we would get stuck in a login loop due to the redirect happening before the session is set.
        // It's likely that the user accidentally forgot to add the path to unauthenticatedPaths, so we add it here.
        middlewareAuth.unauthenticatedPaths.push(url.pathname);
    }

    const matchedPaths: string[] = middlewareAuth.unauthenticatedPaths.filter((pathGlob) => {
        const pathRegex = getMiddlewareAuthPathRegex(pathGlob);

        return pathRegex.exec(request.nextUrl.pathname);
    });

    // If the user is logged out and this path isn't on the allowlist for logged out paths, redirect to AuthKit.
    if (middlewareAuth.enabled && matchedPaths.length === 0 && !session) {
        if (debug) {
            // eslint-disable-next-line no-console
            console.log(`Unauthenticated user on protected route ${request.url}, redirecting to AuthKit`);
        }

        const redirectTo = getAuthorizationUrl({
            state: request.url,
            redirectUri,
        });

        // Fall back to standard Response if NextResponse is not available.
        // This is to support Next.js 13.
        return NextResponse.redirect(redirectTo);
    }

    // If no session, just continue
    if (!session) {
        return NextResponse.next({
            request: { headers: newRequestHeaders },
        });
    }

    const hasValidSession = await verifyAccessToken(session.accessToken);

    const nextCookies = cookies();

    if (hasValidSession) {
        if (debug) {
            // eslint-disable-next-line no-console
            console.log("Session is valid");
        }
        // set the x-workos-session header according to the current cookie value
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newRequestHeaders.set(sessionHeaderName, nextCookies.get(COOKIE_FERN_TOKEN)!.value);
        return NextResponse.next({
            request: { headers: newRequestHeaders },
        });
    }

    try {
        if (debug) {
            // eslint-disable-next-line no-console
            console.log("Session invalid. Attempting refresh", session.refreshToken);
        }

        const { org_id: organizationId } = decodeJwt<AccessToken>(session.accessToken);

        // If the session is invalid (i.e. the access token has expired) attempt to re-authenticate with the refresh token
        const { accessToken, refreshToken, user, impersonator } =
            await workos.userManagement.authenticateWithRefreshToken({
                clientId: getWorkOSClientId(),
                refreshToken: session.refreshToken,
                organizationId,
            });

        if (debug) {
            // eslint-disable-next-line no-console
            console.log("Refresh successful:", refreshToken);
        }

        // Encrypt session with new access and refresh tokens
        const encryptedSession = await encryptSession({
            accessToken,
            refreshToken,
            user,
            impersonator,
        });

        newRequestHeaders.set(sessionHeaderName, encryptedSession);

        const response = NextResponse.next({
            request: { headers: newRequestHeaders },
        });
        // update the cookie
        response.cookies.set(cookieName, encryptedSession, withSecureCookie(redirectUri));
        return response;
    } catch (e) {
        if (debug) {
            // eslint-disable-next-line no-console
            console.log("Failed to refresh. Deleting cookie and redirecting.", e);
        }
        const response = NextResponse.next({
            request: { headers: newRequestHeaders },
        });
        response.cookies.delete(cookieName);
        return response;
    }
}

async function refreshSession(options?: {
    organizationId?: string;
    ensureSignedIn: false;
}): Promise<UserInfo | NoUserInfo>;
async function refreshSession(options: { organizationId?: string; ensureSignedIn: true }): Promise<UserInfo>;
async function refreshSession({
    organizationId: nextOrganizationId,
    ensureSignedIn = false,
}: {
    organizationId?: string;
    ensureSignedIn?: boolean;
} = {}): Promise<UserInfo | NoUserInfo> {
    const session = await getSessionFromCookie();
    if (!session) {
        if (ensureSignedIn) {
            await redirectToSignIn();
        }
        return { user: null };
    }

    const { org_id: organizationIdFromAccessToken } = decodeJwt<AccessToken>(session.accessToken);

    const { accessToken, refreshToken, user, impersonator } = await workos.userManagement.authenticateWithRefreshToken({
        clientId: getWorkOSClientId(),
        refreshToken: session.refreshToken,
        organizationId: nextOrganizationId ?? organizationIdFromAccessToken,
    });

    // Encrypt session with new access and refresh tokens
    const encryptedSession = await encryptSession({
        accessToken,
        refreshToken,
        user,
        impersonator,
    });

    const cookieName = WORKOS_COOKIE_NAME || "wos-session";

    const headersList = headers();
    const url = headersList.get("x-url");

    const nextCookies = cookies();
    nextCookies.set(cookieName, encryptedSession, withSecureCookie(url));

    const { sid: sessionId, org_id: organizationId, role, permissions } = decodeJwt<AccessToken>(accessToken);

    return {
        sessionId,
        user,
        organizationId,
        role,
        permissions,
        impersonator,
        accessToken,
    };
}

function getMiddlewareAuthPathRegex(pathGlob: string) {
    let regex: string;

    try {
        const url = new URL(pathGlob, "https://example.com");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const path = `${url.pathname!}${url.hash || ""}`;

        const tokens = parse(path);
        regex = tokensToRegexp(tokens).source;

        return new RegExp(regex);
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);

        throw new Error(`Error parsing routes for middleware auth. Reason: ${message}`);
    }
}

async function redirectToSignIn(): Promise<void> {
    const headersList = headers();
    const url = headersList.get("x-url");
    const returnPathname = url ? getReturnPathname(url) : undefined;

    redirect(getAuthorizationUrl({ state: url }));
}

async function withAuth(options?: { ensureSignedIn: false }): Promise<UserInfo | NoUserInfo>;
async function withAuth(options: { ensureSignedIn: true }): Promise<UserInfo>;
async function withAuth({ ensureSignedIn = false } = {}): Promise<UserInfo | NoUserInfo> {
    const session = await getSessionFromHeader();

    if (!session) {
        if (ensureSignedIn) {
            await redirectToSignIn();
        }
        return { user: null };
    }

    const { sid: sessionId, org_id: organizationId, role, permissions } = decodeJwt<AccessToken>(session.accessToken);

    return {
        sessionId,
        user: session.user,
        organizationId,
        role,
        permissions,
        impersonator: session.impersonator,
        accessToken: session.accessToken,
    };
}

async function terminateSession(): Promise<void> {
    const { sessionId } = await withAuth();
    if (sessionId) {
        redirect(workos.userManagement.getLogoutUrl({ sessionId }));
    }
    redirect("/");
}

async function verifyAccessToken(accessToken: string) {
    try {
        await jwtVerify(accessToken, JWKS);
        return true;
    } catch {
        return false;
    }
}

async function getSessionFromCookie(response?: NextResponse) {
    const cookie = response ? response.cookies.get(COOKIE_FERN_TOKEN) : cookies().get(COOKIE_FERN_TOKEN);

    if (cookie) {
        return unsealData<Session>(cookie.value, {
            password: getJwtSecretKey(),
        });
    }
}

/**
 * Retrieves the session from the cookie. Meant for use in the middleware, for client side use `withAuth` instead.
 *
 * @returns UserInfo | NoUserInfo
 */
async function getSession(response?: NextResponse): Promise<UserInfo | NoUserInfo> {
    const session = await getSessionFromCookie(response);

    if (!session) {
        return { user: null };
    }

    if (await verifyAccessToken(session.accessToken)) {
        const {
            sid: sessionId,
            org_id: organizationId,
            role,
            permissions,
        } = decodeJwt<AccessToken>(session.accessToken);

        return {
            sessionId,
            user: session.user,
            organizationId,
            role,
            permissions,
            impersonator: session.impersonator,
            accessToken: session.accessToken,
        };
    }
}

async function getSessionFromHeader(): Promise<Session | undefined> {
    const headersList = headers();
    const hasMiddleware = Boolean(headersList.get(middlewareHeaderName));

    if (!hasMiddleware) {
        const url = headersList.get("x-url");
        throw new Error(
            `You are calling 'withAuth' on ${url} that isn’t covered by the AuthKit middleware. Make sure it is running on all paths you are calling 'withAuth' from by updating your middleware config in 'middleware.(js|ts)'.`,
        );
    }

    const authHeader = headersList.get(sessionHeaderName);
    if (!authHeader) {
        return;
    }

    return unsealData<Session>(authHeader, { password: getJwtSecretKey() });
}

function getReturnPathname(url: string): string {
    const newUrl = new URL(url);

    return `${newUrl.pathname}${newUrl.searchParams.size > 0 ? "?" + newUrl.searchParams.toString() : ""}`;
}

export { encryptSession, getSession, refreshSession, terminateSession, updateSession, withAuth };
