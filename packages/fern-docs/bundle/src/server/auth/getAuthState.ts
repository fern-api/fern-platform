import "server-only";

import { AsyncOrSync } from "ts-essentials";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { AuthEdgeConfig, FernUser } from "@fern-docs/auth";
import {
  PreviewUrlAuth,
  getAuthEdgeConfig,
  getPreviewUrlAuthConfig,
} from "@fern-docs/edge-config";
import { removeTrailingSlash } from "@fern-docs/utils";

import { proxyF } from "@/debug_utils";

import { safeVerifyFernJWTConfig } from "./FernJWT";
import { getAllowedRedirectUrls } from "./allowed-redirects";
import { preferPreview } from "./origin";
import { getOryAuthorizationUrl } from "./ory";
import { getReturnToQueryParam } from "./return-to";
import { getWebflowAuthorizationUrl } from "./webflow";
import { getWorkosSSOAuthorizationUrl } from "./workos";
import { handleWorkosAuth } from "./workos-handler";

export type AuthPartner = "workos" | "ory" | "webflow" | "custom";

export interface DomainAndHost {
  /**
   * x-fern-host (NOT the host of the request)
   */
  domain: string;

  /**
   * allowed destinations for redirects
   */
  allowedDestinations: string[];
}

interface AuthStateBase {
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
 * @internal visible for testing
 */
export async function getAuthStateInternal({
  fernToken,
  authConfig,
  previewAuthConfig,
  setFernToken,
  domain,
  host,
}: {
  fernToken: string | undefined;
  authConfig?: AuthEdgeConfig;
  previewAuthConfig?: PreviewUrlAuth;
  setFernToken?: (token: string) => void;
  domain: string;
  host: string;
}): Promise<(pathname?: string) => AsyncOrSync<AuthState>> {
  // if the auth type is neither sso nor basic_token_verification, allow the request to pass through
  if (!authConfig) {
    if (previewAuthConfig != null) {
      if (previewAuthConfig.type === "workos") {
        console.log("really went through this path");
        return (pathname) =>
          proxyF(handleWorkosAuth)({
            host,
            domain,
            fernToken,
            organization: previewAuthConfig.org,
            pathname,
            setFernToken,
          });
      }
    }
    console.log("went through unauth path");
    return () => ({
      authed: false,
      ok: true,
      authorizationUrl: undefined,
      partner: undefined,
    });
  }

  // check if the request is allowed to pass through without authentication
  if (
    authConfig.type === "basic_token_verification" ||
    authConfig.type === "oauth2"
  ) {
    const user = await safeVerifyFernJWTConfig(fernToken, authConfig);
    const partner =
      authConfig.type === "oauth2" ? authConfig.partner : "custom";
    if (user) {
      return () => ({ authed: true, ok: true, user, partner });
    } else {
      return (pathname) => ({
        authed: false,
        ok: true,
        authorizationUrl: getAuthorizationUrl(
          authConfig,
          host,
          domain,
          pathname
        ),
        partner,
      });
    }
  }

  // check if the user is logged in via WorkOS
  if (authConfig.type === "sso" && authConfig.partner === "workos") {
    console.log("went through workos path");
    return (pathname) =>
      proxyF(handleWorkosAuth)({
        host,
        domain,
        fernToken,
        organization: authConfig.organization,
        pathname,
        setFernToken,
        authorizationUrl: {
          connection: authConfig.connection,
          provider: authConfig.provider,
          domainHint: authConfig.domainHint,
          loginHint: authConfig.loginHint,
        },
      });
  }

  return () => ({
    authed: false,
    ok: false,
    authorizationUrl: undefined,
    partner: undefined,
  });
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
export async function createGetAuthState(
  host: string,
  domain: string,
  fernToken: string | undefined,
  authConfig?: AuthEdgeConfig,
  orgMetadata?: {
    org: string;
    isPreview: boolean;
  },
  setFernToken?: (token: string) => void
): Promise<
  DomainAndHost & {
    getAuthState: (pathname?: string) => AsyncOrSync<AuthState>;
    authConfig?: AuthEdgeConfig;
  }
> {
  authConfig ??= await getAuthEdgeConfig(domain);
  const previewAuthConfig =
    orgMetadata != null
      ? await getPreviewUrlAuthConfig(orgMetadata)
      : undefined;

  const getAuthState = await proxyF(getAuthStateInternal)({
    fernToken,
    authConfig,
    setFernToken,
    previewAuthConfig,
    domain,
    host,
  });

  const allowedDestinations = proxyF(getAllowedRedirectUrls)(
    authConfig,
    previewAuthConfig
  );

  return {
    domain,
    allowedDestinations,
    getAuthState,
    authConfig,
  };
}

function getAuthorizationUrl(
  authConfig: AuthEdgeConfig,
  // TODO: we'll need to pass in the basepath here for any customers who are using a non-root basepath.
  host: string,
  domain: string,
  pathname?: string
): string | undefined {
  // TODO: this is currently not a correct implementation of the state parameter b/c it should be signed w/ the jwt secret
  // however, we should not break existing customers who are consuming the state as a `return_to` param in their auth flows.
  const state = `${withDefaultProtocol(
    removeTrailingSlash(preferPreview(host, domain))
  )}${pathname ?? ""}`;

  if (authConfig.type === "basic_token_verification") {
    const destination = new URL(authConfig.redirect);

    // note: `redirect` is allowed to override the default redirect uri, and the `return_to` param
    if (!destination.searchParams.has("redirect_uri")) {
      const redirectUri = `${withDefaultProtocol(
        removeTrailingSlash(preferPreview(host, domain))
      )}/api/fern-docs/auth/jwt/callback`;

      destination.searchParams.set("redirect_uri", redirectUri);
    }
    if (!destination.searchParams.has(getReturnToQueryParam(authConfig))) {
      destination.searchParams.set(getReturnToQueryParam(authConfig), state);
    }
    return destination.toString();
  } else if (authConfig.type === "sso" && authConfig.partner === "workos") {
    const redirectUri = `${withDefaultProtocol(
      removeTrailingSlash(preferPreview(host, domain))
    )}/api/fern-docs/auth/sso/callback`;

    return getWorkosSSOAuthorizationUrl({
      state,
      redirectUri,
      organization: authConfig.organization,
      connection: authConfig.connection,
      provider: authConfig.provider,
      domainHint: authConfig.domainHint,
      loginHint: authConfig.loginHint,
    });
  } else if (authConfig.type === "oauth2") {
    if (authConfig.partner === "webflow") {
      return getWebflowAuthorizationUrl(authConfig, {
        state,
        redirectUri: `${withDefaultProtocol(
          removeTrailingSlash(preferPreview(host, domain))
        )}/api/fern-docs/oauth/webflow/callback`,
      });
    } else if (authConfig.partner === "ory") {
      return getOryAuthorizationUrl(authConfig, {
        state,
        redirectUri: `${withDefaultProtocol(
          removeTrailingSlash(preferPreview(host, domain))
        )}/api/fern-docs/oauth/ory/callback`,
      });
    }
  }

  return undefined;
}

export async function getWorkosRbacRoles(
  org: string,
  email: string
): Promise<string[]> {
  try {
    // TODO: use `rbac.ferndocs.dev` for staging, and `rbac.ferndocs.com` for production, once available
    const roles = await fetch(
      `https://rbac.ferndocs.dev/${encodeURIComponent(org)}/users/${encodeURIComponent(email)}/roles`
    ).then((res) => res.json());
    if (Array.isArray(roles)) {
      return roles.filter((role) => typeof role === "string");
    }
    return [];
  } catch (error) {
    console.error(`Error fetching RBAC roles for ${org}/${email}: ${error}`);
    return [];
  }
}
