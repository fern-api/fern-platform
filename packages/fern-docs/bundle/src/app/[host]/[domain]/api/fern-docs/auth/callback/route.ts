import { NextRequest, NextResponse } from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";

import { FernNextResponse } from "@/server/FernNextResponse";
import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { preferPreview } from "@/server/auth/origin";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = req.nextUrl.host;

  const config = await getAuthEdgeConfig(domain);

  // The authorization code returned by AuthKit
  const code = req.nextUrl.searchParams.get("code");
  const return_to = req.nextUrl.searchParams.get(getReturnToQueryParam(config));
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");
  const redirectLocation =
    safeUrl(return_to) ??
    safeUrl(withDefaultProtocol(preferPreview(host, domain)));

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
  nextUrl.host = preferPreview(host, domain);

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
