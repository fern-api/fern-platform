import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig, FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import type { NextRequest } from "next/server";
import urlJoin from "url-join";
import { withBasicTokenAnonymous } from "../withBasicTokenAnonymous";
import { getDocsDomainEdge } from "../xfernhost/edge";
import { safeVerifyFernJWTConfig } from "./FernJWT";

export type AuthPartner = "workos" | "ory" | "webflow" | "custom";

interface NotLoggedIn {
    xFernHost: string;
    isLoggedIn: false;
    authorizationUrl?: string;
    status: 200 | 401 | 403 | 500;
    partner: AuthPartner | undefined;
}

interface IsLoggedIn {
    xFernHost: string;
    isLoggedIn: true;
    user: FernUser;
    partner: AuthPartner;
}

export type AuthState = NotLoggedIn | IsLoggedIn;

export async function getAuthStateEdge(request: NextRequest): Promise<AuthState> {
    const xFernHost = getDocsDomainEdge(request);
    const fernToken = request.cookies.get(COOKIE_FERN_TOKEN)?.value;
    return getAuthState(xFernHost, fernToken, request.nextUrl.pathname);
}

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
    xFernHost: string,
    fernToken: string | undefined,
    pathname?: string,
    authConfig?: AuthEdgeConfig,
): Promise<AuthState> {
    // don't fetch auth config in dev (for now)
    authConfig ??= process.env.NODE_ENV === "development" ? undefined : await getAuthEdgeConfig(xFernHost);

    // if the auth type is neither sso nor basic_token_verification, allow the request to pass through
    // we're currently assuming that all oauth2 integrations are meant for API Playground. This may change.
    if (!authConfig || (authConfig.type !== "sso" && authConfig.type !== "basic_token_verification")) {
        return { xFernHost, isLoggedIn: false, status: 200, partner: authConfig?.partner };
    }

    const user = await safeVerifyFernJWTConfig(fernToken, authConfig);

    // check if the request is allowed to pass through without authentication
    if (authConfig.type === "basic_token_verification") {
        if (user) {
            return { xFernHost, isLoggedIn: true, user, partner: "custom" };
        } else {
            const isAuthRequired = pathname ? withBasicTokenAnonymous(authConfig, pathname) : true;
            return {
                xFernHost,
                isLoggedIn: false,
                status: isAuthRequired ? 403 : 200,
                authorizationUrl: getAuthorizationUrl(authConfig, xFernHost, pathname),
                partner: "custom",
            };
        }
    }

    // TODO: implement workos auth
    if (authConfig.type === "sso") {
        return { xFernHost, isLoggedIn: false, status: 401, partner: authConfig.partner };
    }

    // if the auth type is not supported, return a 500
    return { xFernHost, isLoggedIn: false, status: 500, partner: undefined };
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
    }
    return undefined;
}
