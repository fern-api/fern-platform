import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig, FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import urlJoin from "url-join";
import { safeVerifyFernJWTConfig } from "./FernJWT";
import { getWorkosSSOAuthorizationUrl } from "./workos";
import { encryptSession, getSessionFromToken, refreshSession, toSessionUserInfo } from "./workos-session";
import { toFernUser } from "./workos-user-to-fern-user";

export type AuthPartner = "workos" | "ory" | "webflow" | "custom";

interface AuthStateBase {
    /**
     * x-fern-host (NOT the host of the request)
     */
    domain: string;
    /**
     * The host of the request
     */
    host: string;
    /**
     * If true, the request is allowed to pass through
     * Otherwise, the request must be redirected to the authorizationUrl, or return a 401, or 403
     */
    ok: boolean;
}

// ok=false -> 401
interface NotLoggedIn extends AuthStateBase {
    /**
     * discriminant
     */
    authed: false;
    /**
     * The url to redirect to for authentication, containing the state parameter and redirect url
     */
    authorizationUrl: string | undefined;
    /**
     * The auth partner that is used for authentication (e.g. workos, custom)
     */
    partner: AuthPartner | undefined;
}

// ok=false -> 403
interface IsLoggedIn extends AuthStateBase {
    /**
     * discriminant
     */
    authed: true;
    /**
     * The user payload from the Fern JWT, and the AuthPartner are both guaranteed to be present if the user is logged in
     */
    user: FernUser;
    partner: AuthPartner;
}

export type AuthState = NotLoggedIn | IsLoggedIn;

/**
 * Check if the user is logged in and the session is valid for the current docs.
 * - if the auth config is not present, assume that the site is available to the public
 * - if the auth config is present, check if the user is logged in and the session is valid for the current docs
 * - if the user is not logged in, check if the request is allowed to pass through without authentication; otherwise, redirect to the login page
 *
 * @param request - the request to check the headers / cookies
 * @param next - the function to call if the user is logged in and the session is valid for the current pathname
 */
export async function getAuthState(
    domain: string,
    host: string,
    fernToken: string | undefined,
    pathname?: string,
    authConfig?: AuthEdgeConfig,
    setFernToken?: (token: string) => void,
): Promise<AuthState> {
    authConfig ??= await getAuthEdgeConfig(domain);

    // if the auth type is neither sso nor basic_token_verification, allow the request to pass through
    // we're currently assuming that all oauth2 integrations are meant for API Playground. This may change.
    if (!authConfig || (authConfig.type !== "sso" && authConfig.type !== "basic_token_verification")) {
        return { domain, host, authed: false, ok: true, authorizationUrl: undefined, partner: authConfig?.partner };
    }

    const authorizationUrl = getAuthorizationUrl(authConfig, host, pathname);

    // check if the request is allowed to pass through without authentication
    if (authConfig.type === "basic_token_verification") {
        const user = await safeVerifyFernJWTConfig(fernToken, authConfig);
        const partner = "custom";
        if (user) {
            return { domain, host, authed: true, ok: true, user, partner };
        } else {
            return { domain, host, authed: false, ok: true, authorizationUrl, partner };
        }
    }

    // check if the user is logged in via WorkOS
    if (authConfig.type === "sso" && authConfig.partner === "workos") {
        const session = fernToken != null ? await getSessionFromToken(fernToken) : undefined;
        const workosUserInfo = await toSessionUserInfo(session);
        if (workosUserInfo.user) {
            // TODO: should this be stored in the session itself?
            const roles = await getWorkosRbacRoles(authConfig.organization, workosUserInfo.user.email);
            return {
                domain,
                host,
                authed: true,
                ok: true,
                user: toFernUser(workosUserInfo, roles),
                partner: authConfig.partner,
            };
        }

        if (session?.refreshToken) {
            const updatedSession = await refreshSession(session);
            if (updatedSession) {
                if (setFernToken) {
                    setFernToken(await encryptSession(updatedSession));
                }
                return {
                    domain,
                    host,
                    authed: true,
                    ok: true,
                    user: toFernUser(await toSessionUserInfo(updatedSession)),
                    partner: authConfig.partner,
                };
            }
        }

        return { domain, host, authed: false, ok: false, authorizationUrl, partner: authConfig.partner };
    }

    return { domain, host, authed: false, ok: false, authorizationUrl: undefined, partner: undefined };
}

function getAuthorizationUrl(authConfig: AuthEdgeConfig, host: string, pathname?: string): string | undefined {
    // TODO: this is currently not a correct implementation of the state parameter b/c it should be signed w/ the jwt secret
    // however, we should not break existing customers who are consuming the state as a `return_to` param in their auth flows.
    const state = urlJoin(removeTrailingSlash(withDefaultProtocol(host)), pathname ?? "");

    if (authConfig.type === "basic_token_verification") {
        if (!pathname) {
            return authConfig.redirect;
        }

        const destination = new URL(authConfig.redirect);
        destination.searchParams.set("state", state);
        return destination.toString();
    } else if (authConfig.type === "sso" && authConfig.partner === "workos") {
        const redirectUri = urlJoin(removeTrailingSlash(withDefaultProtocol(host)), "/api/fern-docs/auth/sso/callback");
        return getWorkosSSOAuthorizationUrl({
            state,
            redirectUri,
            organization: authConfig.organization,
            connection: authConfig.connection,
            provider: authConfig.provider,
            domainHint: authConfig.domainHint,
            loginHint: authConfig.loginHint,
        });
    }

    return undefined;
}

export async function getWorkosRbacRoles(org: string, email: string): Promise<string[]> {
    try {
        // TODO: use `rbac.ferndocs.dev` for staging, and `rbac.ferndocs.com` for production, once available
        const roles = await fetch(
            `https://rbac.ferndocs.dev/${encodeURIComponent(org)}/users/${encodeURIComponent(email)}/roles`,
        ).then((res) => res.json());
        if (Array.isArray(roles)) {
            return roles.filter((role) => typeof role === "string");
        }
        return [];
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Error fetching RBAC roles for ${org}/${email}: ${error}`);
        return [];
    }
}
