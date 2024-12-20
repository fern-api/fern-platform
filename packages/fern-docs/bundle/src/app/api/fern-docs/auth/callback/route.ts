import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { FernNextResponse } from "@/server/FernNextResponse";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { HEADER_X_FERN_HOST } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);

  const config = await getAuthEdgeConfig(domain);

  // The authorization code returned by AuthKit
  const code = req.nextUrl.searchParams.get("code");
  const return_to = req.nextUrl.searchParams.get(getReturnToQueryParam(config));
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");
  const redirectLocation =
    safeUrl(return_to) ?? safeUrl(withDefaultProtocol(host));

  if (error != null) {
    return redirectWithLoginError(
      req,
      redirectLocation,
      error,
      error_description
    );
  }

  if (typeof code !== "string") {
    return redirectWithLoginError(
      req,
      redirectLocation,
      "missing_authorization_code",
      "Couldn't login, please try again"
    );
  }
  const nextUrl = req.nextUrl.clone();

  // Redirect to x-fern-host domain if it exists
  // this is to ensure proxied origins are used for the redirect
  if (req.headers.has(HEADER_X_FERN_HOST)) {
    // TODO: validate allowlist of domains to prevent open redirects
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    nextUrl.host = req.headers.get(HEADER_X_FERN_HOST)!;
  }

  if (config?.type === "oauth2" && config.partner === "ory") {
    nextUrl.pathname = nextUrl.pathname.replace(
      "/api/fern-docs/auth/callback",
      "/api/fern-docs/oauth/ory/callback"
    );
    return FernNextResponse.redirect(req, {
      destination: nextUrl,
      allowedDestinations: getAllowedRedirectUrls(config),
    });
  } else if (config?.type === "sso") {
    nextUrl.pathname = nextUrl.pathname.replace(
      "/api/fern-docs/auth/callback",
      "/api/fern-docs/auth/sso/callback"
    );
    return FernNextResponse.redirect(req, {
      destination: nextUrl,
      allowedDestinations: getAllowedRedirectUrls(config),
    });
  }

  return redirectWithLoginError(
    req,
    redirectLocation,
    "unknown_error",
    "Couldn't login, please try again"
  );
}
