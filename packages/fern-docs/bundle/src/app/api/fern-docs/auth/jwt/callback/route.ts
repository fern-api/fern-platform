import { FernNextResponse } from "@/server/FernNextResponse";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import {
  getAllowedRedirectUrls,
  getReturnToQueryParam,
  safeVerifyFernJWTConfig,
  withSecureCookie,
} from "@fern-docs/auth";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);
  const edgeConfig = await getAuthEdgeConfig(domain);

  // since we expect the callback to be redirected to, the token will be in the query params
  const token = req.nextUrl.searchParams.get(COOKIE_FERN_TOKEN);
  const returnTo = req.nextUrl.searchParams.get(
    getReturnToQueryParam(edgeConfig)
  );
  const redirectLocation =
    safeUrl(returnTo) ?? safeUrl(withDefaultProtocol(host));

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

  const cookieJar = cookies();
  cookieJar.set(
    COOKIE_FERN_TOKEN,
    token,
    withSecureCookie(withDefaultProtocol(host))
  );

  return res;
}
