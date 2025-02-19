import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { FernNextResponse } from "@/server/FernNextResponse";
import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { preferPreview } from "@/server/auth/origin";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = req.nextUrl.host;
  const edgeConfig = await getAuthEdgeConfig(domain);

  // since we expect the callback to be redirected to, the token will be in the query params
  const token = req.nextUrl.searchParams.get(COOKIE_FERN_TOKEN);
  const returnTo = req.nextUrl.searchParams.get(
    getReturnToQueryParam(edgeConfig)
  );
  const redirectLocation =
    safeUrl(returnTo) ??
    safeUrl(withDefaultProtocol(preferPreview(host, domain)));
  console.log("Redirecting", host, domain, redirectLocation);

  if (edgeConfig?.type !== "basic_token_verification" || token == null) {
    console.error(`Invalid config for domain ${domain}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }

  const fernUser = await safeVerifyFernJWTConfig(token, edgeConfig);

  if (fernUser == null) {
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }

  const res = redirectLocation
    ? FernNextResponse.redirect(req, {
        destination: redirectLocation,
        allowedDestinations: getAllowedRedirectUrls(edgeConfig),
      })
    : NextResponse.next();

  const cookieJar = await cookies();
  cookieJar.set(
    COOKIE_FERN_TOKEN,
    token,
    withSecureCookie(withDefaultProtocol(host))
  );

  return res;
}
