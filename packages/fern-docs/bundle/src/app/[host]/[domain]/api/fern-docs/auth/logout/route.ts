import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_FERN_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@fern-docs/utils";

import { FernNextResponse } from "@/server/FernNextResponse";
import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { preferPreview } from "@/server/auth/origin";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withDeleteCookie } from "@/server/auth/with-secure-cookie";
import { revokeSessionForToken } from "@/server/auth/workos-session";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const host = req.nextUrl.host;
  const domain = getDocsDomainEdge(req);
  const cookieJar = await cookies();

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
    safeUrl(withDefaultProtocol(preferPreview(host, domain))) ??
    new URL(domain);

  const res = FernNextResponse.redirect(req, {
    destination: redirectLocation,
    allowedDestinations: getAllowedRedirectUrls(authConfig),
  });
  cookieJar.delete(
    withDeleteCookie(
      COOKIE_FERN_TOKEN,
      withDefaultProtocol(preferPreview(host, domain))
    )
  );
  cookieJar.delete(
    withDeleteCookie(
      COOKIE_ACCESS_TOKEN,
      withDefaultProtocol(preferPreview(host, domain))
    )
  );
  cookieJar.delete(
    withDeleteCookie(
      COOKIE_REFRESH_TOKEN,
      withDefaultProtocol(preferPreview(host, domain))
    )
  );
  return res;
}
