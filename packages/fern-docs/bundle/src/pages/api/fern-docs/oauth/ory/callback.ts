import { getAllowedRedirectUrls } from "@/server/auth/allowed-redirects";
import { signFernJWT } from "@/server/auth/FernJWT";
import { OryOAuth2Client } from "@/server/auth/ory";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { FernNextResponse } from "@/server/FernNextResponse";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernUser, OryAccessTokenSchema } from "@fern-docs/auth";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  COOKIE_ACCESS_TOKEN,
  COOKIE_FERN_TOKEN,
  COOKIE_REFRESH_TOKEN,
} from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
  if (req.method !== "GET") {
    return new NextResponse(null, { status: 405 });
  }

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
    // eslint-disable-next-line no-console
    console.error(`OAuth2 error: ${error} - ${error_description}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      error,
      error_description
    );
  }

  if (typeof code !== "string") {
    // eslint-disable-next-line no-console
    console.error("Missing code in query params");
    return redirectWithLoginError(
      req,
      redirectLocation,
      "missing_authorization_code",
      "Couldn't login, please try again"
    );
  }

  if (config == null || config.type !== "oauth2" || config.partner !== "ory") {
    // eslint-disable-next-line no-console
    console.log(`Invalid config for domain ${domain}`);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }

  const oauthClient = new OryOAuth2Client(config);
  try {
    const { access_token, refresh_token } = await oauthClient.getToken(code);
    const token = OryAccessTokenSchema.parse(
      await oauthClient.decode(access_token)
    );
    const fernUser: FernUser = {
      name: token.ext?.name,
      email: token.ext?.email,
    };
    const expires = token.exp == null ? undefined : new Date(token.exp * 1000);
    // TODO: validate allowlist of domains to prevent open redirects
    const res = redirectLocation
      ? FernNextResponse.redirect(req, {
          destination: redirectLocation,
          allowedDestinations: getAllowedRedirectUrls(config),
        })
      : NextResponse.next();
    res.cookies.set(
      COOKIE_FERN_TOKEN,
      await signFernJWT(fernUser),
      withSecureCookie(withDefaultProtocol(host), { expires })
    );

    // TODO: should we have a more specific place to set these cookies (such as inside fern_token, or fern_ory, etc.)?
    res.cookies.set(
      COOKIE_ACCESS_TOKEN,
      access_token,
      withSecureCookie(withDefaultProtocol(host), { expires })
    );
    if (refresh_token != null) {
      res.cookies.set(
        COOKIE_REFRESH_TOKEN,
        refresh_token,
        withSecureCookie(withDefaultProtocol(host), { expires })
      );
    } else {
      res.cookies.delete(COOKIE_REFRESH_TOKEN);
    }
    return res;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error getting access token", error);
    return redirectWithLoginError(
      req,
      redirectLocation,
      "unknown_error",
      "Couldn't login, please try again"
    );
  }
}
