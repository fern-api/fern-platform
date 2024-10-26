import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig, FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import urlJoin from "url-join";
import { safeVerifyFernJWTConfig } from "./FernJWT";

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
): Promise<AuthState> {
    authConfig ??= await getAuthEdgeConfig(domain);

    // if the auth type is neither sso nor basic_token_verification, allow the request to pass through
    // we're currently assuming that all oauth2 integrations are meant for API Playground. This may change.
    if (!authConfig || (authConfig.type !== "sso" && authConfig.type !== "basic_token_verification")) {
        return { domain, host, authed: false, ok: true, authorizationUrl: undefined, partner: authConfig?.partner };
    }

    const user = await safeVerifyFernJWTConfig(fernToken, authConfig);

    // check if the request is allowed to pass through without authentication
    if (authConfig.type === "basic_token_verification") {
        const partner = "custom";
        if (user) {
            return { domain, host, authed: true, ok: true, user, partner };
        } else {
            const authorizationUrl = getAuthorizationUrl(authConfig, domain, pathname);
            return { domain, host, authed: false, ok: true, authorizationUrl, partner };
        }
    }

    // TODO: implement workos auth
    if (authConfig.type === "sso") {
        return user
            ? { domain, host, authed: true, ok: true, user, partner: authConfig.partner }
            : { domain, host, authed: false, ok: false, authorizationUrl: undefined, partner: authConfig.partner };
    }

    return { domain, host, authed: false, ok: false, authorizationUrl: undefined, partner: undefined };
}

function getAuthorizationUrl(authConfig: AuthEdgeConfig, xFernHost: string, pathname?: string): string | undefined {
    if (authConfig.type === "basic_token_verification") {
        if (!pathname) {
            return authConfig.redirect;
        }

        const destination = new URL(authConfig.redirect);
        // TODO: this is currently not a correct implementation of the state parameter b/c it should be signed w/ the jwt secret
        // however, we should not break existing customers who are consuming the state as a `return_to` param in their auth flows.
        destination.searchParams.set("state", urlJoin(withDefaultProtocol(xFernHost), pathname));
        return destination.toString();
    } else if (authConfig.type === "sso" && authConfig.partner === "workos") {
        // TODO: implement workos auth redirect url
        return undefined;
    }

    return undefined;
}
