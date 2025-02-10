import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { WebflowClient } from "webflow-api";

import { FernNextResponse } from "@/server/FernNextResponse";
import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);
  const config = await getAuthEdgeConfig(domain);

  const code = req.nextUrl.searchParams.get("code");
  const return_to = req.nextUrl.searchParams.get(getReturnToQueryParam(config));
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");
  const redirectLocation =
    safeUrl(return_to) ?? safeUrl(withDefaultProtocol(host));

  if (error != null) {
    console.error(`OAuth2 error: ${error} - ${error_description}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      error,
      error_description
    );
  }

  if (typeof code !== "string") {
    console.error("Missing code in query params");
    return redirectWithLoginError(
      req,
      redirectLocation,
      "missing_authorization_code",
      "Couldn't login, please try again"
    );
  }

  if (
    config == null ||
    config.type !== "oauth2" ||
    config.partner !== "webflow"
  ) {
    console.log(`Invalid config for domain ${domain}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }

  try {
    const accessToken = await WebflowClient.getAccessToken({
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      redirectUri: config.redirectUri,
      code,
    });

    const res = redirectLocation
      ? FernNextResponse.redirect(req, {
          destination: redirectLocation,
          allowedDestinations: getAllowedRedirectUrls(config),
        })
      : NextResponse.next();
    (await cookies()).set(
      "access_token",
      accessToken,
      withSecureCookie(withDefaultProtocol(host))
    );
    return res;
  } catch (error) {
    console.error("Error getting access token", error);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }
}
