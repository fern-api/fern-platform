import { FernNextResponse } from "@/server/FernNextResponse";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import {
  getAllowedRedirectUrls,
  getReturnToQueryParam,
  revokeSessionForToken,
  withDeleteCookie,
} from "@fern-docs/auth";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_FERN_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@fern-docs/utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const cookieJar = cookies();

  const authConfig = await getAuthEdgeConfig(domain);

  if (authConfig?.type === "sso" && authConfig.partner === "workos") {
    // revoke session in WorkOS
    await revokeSessionForToken(cookieJar.get(COOKIE_FERN_TOKEN)?.value);
  }

  const logoutUrl = safeUrl(
    authConfig?.type === "basic_token_verification"
      ? authConfig.logout
      : undefined
  );

  const return_to_param = getReturnToQueryParam(authConfig);

  // if logout url is provided, append the state to it before redirecting
  const returnToParam = req.nextUrl.searchParams.get(return_to_param);
  if (returnToParam != null) {
    logoutUrl?.searchParams.set(return_to_param, returnToParam);
  }

  const redirectLocation =
    logoutUrl ??
    safeUrl(req.nextUrl.searchParams.get(return_to_param)) ??
    safeUrl(withDefaultProtocol(getHostEdge(req))) ??
    new URL(domain);

  const res = FernNextResponse.redirect(req, {
    destination: redirectLocation,
    allowedDestinations: getAllowedRedirectUrls(authConfig),
  });
  cookieJar.delete(
    withDeleteCookie(COOKIE_FERN_TOKEN, withDefaultProtocol(getHostEdge(req)))
  );
  cookieJar.delete(
    withDeleteCookie(COOKIE_ACCESS_TOKEN, withDefaultProtocol(getHostEdge(req)))
  );
  cookieJar.delete(
    withDeleteCookie(
      COOKIE_REFRESH_TOKEN,
      withDefaultProtocol(getHostEdge(req))
    )
  );
  return res;
}
