import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { WebflowClient } from "webflow-api";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { withoutStaging } from "@fern-docs/utils";

import { FernNextResponse } from "@/server/FernNextResponse";
import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { preferPreview } from "@/server/auth/origin";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const domainWithoutStaging = withoutStaging(domain);
  const host = req.nextUrl.host;
  const config = await getAuthEdgeConfig(domainWithoutStaging);

  const code = req.nextUrl.searchParams.get("code");
  const return_to = req.nextUrl.searchParams.get(getReturnToQueryParam(config));
  const error = req.nextUrl.searchParams.get("error");
  const error_description = req.nextUrl.searchParams.get("error_description");
  const redirectLocation =
    safeUrl(return_to) ??
    safeUrl(withDefaultProtocol(preferPreview(host, domainWithoutStaging)));

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
    console.log(`Invalid config for domain ${domainWithoutStaging}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "config_error",
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
      withSecureCookie(
        withDefaultProtocol(preferPreview(host, domainWithoutStaging))
      )
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
