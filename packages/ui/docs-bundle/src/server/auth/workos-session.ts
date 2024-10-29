"use server";

import { sealData, unsealData } from "iron-session";
import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";
import { NextResponse } from "next/server";
import { AccessToken, NoWorkOSUserInfo, WorkOSSession, WorkOSUserInfo } from "./interfaces";
import { getJwtSecretKey, getWorkOSClientId, workos } from "./workos";

// This is adapted from https://github.com/workos/authkit-nextjs/blob/main/src/session.ts

const JWKS = createRemoteJWKSet(new URL(workos.userManagement.getJwksUrl(getWorkOSClientId())));

async function encryptSession(session: WorkOSSession): Promise<string> {
    return sealData(session, { password: getJwtSecretKey() });
}

async function refreshSession(session: WorkOSSession): Promise<WorkOSSession | undefined> {
    try {
        const { org_id: organizationId } = decodeJwt<AccessToken>(session.accessToken);
        const { accessToken, refreshToken, user, impersonator } =
            await workos.userManagement.authenticateWithRefreshToken({
                clientId: getWorkOSClientId(),
                refreshToken: session.refreshToken,
                organizationId,
            });
        return {
            accessToken,
            refreshToken,
            user,
            impersonator,
        };
    } catch (e) {
        return undefined;
    }
}

// async function updateSession(request: NextRequest): Promise<NextResponse> {
//     const session = await getSessionFromCookie();

//     // If no session, just continue
//     if (!session) {
//         return NextResponse.next();
//     }

//     const hasValidSession = await verifyAccessToken(session.accessToken);

//     if (hasValidSession) {
//         return NextResponse.next();
//     }

//     try {
//         const { org_id: organizationId } = decodeJwt<AccessToken>(session.accessToken);

//         // If the session is invalid (i.e. the access token has expired) attempt to re-authenticate with the refresh token
//         const { accessToken, refreshToken, user, impersonator } =
//             await workos.userManagement.authenticateWithRefreshToken({
//                 clientId: getWorkOSClientId(),
//                 refreshToken: session.refreshToken,
//                 organizationId,
//             });

//         // Encrypt session with new access and refresh tokens
//         const encryptedSession = await encryptSession({
//             accessToken,
//             refreshToken,
//             user,
//             impersonator,
//         });

//         const response = NextResponse.next();

//         // update the cookie
//         response.cookies.set(COOKIE_FERN_TOKEN, encryptedSession, withSecureCookie(request.url));
//         return response;
//     } catch (e) {
//         // Failed to refresh, delete the cookie and redirect to sign in
//         const response = NextResponse.next();
//         response.cookies.delete(COOKIE_FERN_TOKEN);
//         return response;
//     }
// }

// async function refreshSession({
//     organizationId: nextOrganizationId,
//     ensureSignedIn = false,
//     returnToUrl,
//     redirectUri,
// }: {
//     organizationId?: string;
//     ensureSignedIn?: boolean;
//     returnToUrl: string;
//     redirectUri: string;
// }): Promise<WorkOSUserInfo | NoWorkOSUserInfo> {
//     const session = await getSessionFromCookie();
//     if (!session) {
//         if (ensureSignedIn) {
//             await redirectToSignIn(returnToUrl, redirectUri);
//         }
//         return { user: null };
//     }

//     const { org_id: organizationIdFromAccessToken } = decodeJwt<AccessToken>(session.accessToken);

//     const { accessToken, refreshToken, user, impersonator } = await workos.userManagement.authenticateWithRefreshToken({
//         clientId: getWorkOSClientId(),
//         refreshToken: session.refreshToken,
//         organizationId: nextOrganizationId ?? organizationIdFromAccessToken,
//     });

//     // Encrypt session with new access and refresh tokens
//     const encryptedSession = await encryptSession({
//         accessToken,
//         refreshToken,
//         user,
//         impersonator,
//     });

//     const nextCookies = cookies();
//     nextCookies.set(COOKIE_FERN_TOKEN, encryptedSession, withSecureCookie(returnToUrl));

//     const { sid: sessionId, org_id: organizationId, role, permissions } = decodeJwt<AccessToken>(accessToken);

//     return {
//         sessionId,
//         user,
//         organizationId,
//         role,
//         permissions,
//         impersonator,
//         accessToken,
//     };
// }

// async function redirectToSignIn(returnToUrl: string, redirectUri: string): Promise<void> {
//     redirect(getAuthorizationUrl({ state: returnToUrl, redirectUri }));
// }

async function terminateSession(session: WorkOSSession): Promise<NextResponse> {
    const { sid: sessionId } = decodeJwt<AccessToken>(session.accessToken);
    return NextResponse.redirect(workos.userManagement.getLogoutUrl({ sessionId }));
}

async function verifyAccessToken(accessToken: string) {
    try {
        await jwtVerify(accessToken, JWKS);
        return true;
    } catch {
        return false;
    }
}

async function getSessionFromToken(token: string): Promise<WorkOSSession | undefined> {
    return unsealData<WorkOSSession>(token, { password: getJwtSecretKey() });
}

// async function getSessionFromCookie(response?: NextResponse): Promise<WorkOSSession | undefined> {
//     const cookie = response ? response.cookies.get(COOKIE_FERN_TOKEN) : cookies().get(COOKIE_FERN_TOKEN);

//     if (cookie) {
//         return getSessionFromToken(cookie.value);
//     }

//     return undefined;
// }

/**
 * Retrieves the session from the cookie. Meant for use in the middleware, for client side use `withAuth` instead.
 *
 * @returns UserInfo | NoUserInfo
 */
async function toSessionUserInfo(session?: WorkOSSession): Promise<WorkOSUserInfo | NoWorkOSUserInfo> {
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

    return { user: null };
}

export { encryptSession, getSessionFromToken, refreshSession, terminateSession, toSessionUserInfo };
