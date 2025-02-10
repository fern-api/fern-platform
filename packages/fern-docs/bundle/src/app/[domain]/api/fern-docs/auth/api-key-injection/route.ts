import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import urlJoin from "url-join";
import { WebflowClient } from "webflow-api";
import type { OauthScope } from "webflow-api/api/types/OAuthScope";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { APIKeyInjectionConfig, OryAccessTokenSchema } from "@fern-docs/auth";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import { removeTrailingSlash } from "@fern-docs/utils";

import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { OryOAuth2Client, getOryAuthorizationUrl } from "@/server/auth/ory";
import { getReturnToQueryParam } from "@/server/auth/return-to";
import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { fernToken_admin } from "@/server/env-variables";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";

export const runtime = "edge";

export async function GET(
  req: NextRequest
): Promise<NextResponse<APIKeyInjectionConfig>> {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);
  const cookieJar = await cookies();

  const edgeConfig = await getAuthEdgeConfig(domain);

  const returnToQueryParam = getReturnToQueryParam(edgeConfig);

  const fern_token = fernToken_admin();
  const access_token = cookieJar.get("access_token")?.value;
  const refresh_token = cookieJar.get("refresh_token")?.value;
  const fernUser = await safeVerifyFernJWTConfig(fern_token, edgeConfig);

  // if the JWT is valid, and the user has an API key, return it
  if (fernUser?.api_key != null) {
    return NextResponse.json({
      enabled: true,
      authenticated: true,
      access_token: fernUser.api_key,
      returnToQueryParam,
    });
  }

  if (!edgeConfig) {
    return NextResponse.json({
      enabled: false,
      returnToQueryParam,
    });
  }

  if (
    edgeConfig.type === "sso" ||
    edgeConfig["api-key-injection-enabled"] !== true
  ) {
    return NextResponse.json({
      enabled: false,
      returnToQueryParam,
    });
  }

  if (edgeConfig.type === "basic_token_verification") {
    if (!edgeConfig.redirect) {
      return NextResponse.json({
        enabled: false,
        returnToQueryParam,
      });
    }

    return NextResponse.json({
      enabled: true,
      authenticated: false,
      authorizationUrl: edgeConfig.redirect,
      returnToQueryParam,
    });
  }

  if (edgeConfig.type !== "oauth2") {
    return NextResponse.json({
      enabled: false,
      returnToQueryParam,
    });
  }

  // assume that if the edge config is set for webflow, api key injection is always enabled
  if (edgeConfig.partner === "webflow") {
    if (access_token == null) {
      const authorizationUrl = WebflowClient.authorizeURL({
        clientId: edgeConfig.clientId,
        redirectUri: edgeConfig.redirectUri,

        // note: this is not validated
        scope: (edgeConfig.scope as OauthScope | OauthScope[]) ?? [],
      });

      return NextResponse.json({
        enabled: true,
        authenticated: false,
        authorizationUrl,
        returnToQueryParam,
      });
    }

    return NextResponse.json({
      enabled: true,
      authenticated: true,
      access_token,
      returnToQueryParam,
    });
  }

  if (edgeConfig.partner === "ory") {
    const client = new OryOAuth2Client(edgeConfig);
    const tokens = await client.getOrRefreshAccessToken(
      access_token,
      refresh_token
    );

    if (tokens == null) {
      return NextResponse.json({
        enabled: true,
        authenticated: false,
        authorizationUrl: getOryAuthorizationUrl(edgeConfig, {
          redirectUri: urlJoin(
            removeTrailingSlash(withDefaultProtocol(host)),
            "/api/fern-docs/oauth/ory/callback"
          ),
        }),
        returnToQueryParam,
      });
    } else {
      const expires =
        tokens.exp != null ? new Date(tokens.exp * 1000) : undefined;

      let access_token = tokens.access_token;
      let refresh_token = tokens.refresh_token;
      let exp = expires;

      // TODO: i'm not sure if this is necessary because we already refresh the token in getOrRefreshAccessToken
      const token = OryAccessTokenSchema.parse(
        await client.decode(access_token)
      );
      exp = token.exp == null ? undefined : new Date(token.exp * 1000);
      // If access token is nullish or within 5 minutes of expiration, refresh it
      try {
        if (
          refresh_token &&
          exp &&
          exp < new Date(Date.now() + 1000 * 60 * 10)
        ) {
          const {
            access_token: oauth_access_token,
            refresh_token: oauth_refresh_token,
          } = await client.refreshToken(refresh_token);
          access_token = oauth_access_token;
          if (refresh_token != null) {
            refresh_token = oauth_refresh_token;
          }
        }
      } catch (error) {
        console.error(error);
      }

      const response = NextResponse.json<APIKeyInjectionConfig>({
        enabled: true,
        authenticated: true,
        access_token,
        returnToQueryParam,
      });

      if (access_token !== cookieJar.get("access_token")?.value) {
        cookieJar.set(
          "access_token",
          access_token,
          withSecureCookie(withDefaultProtocol(host), {
            expires: exp,
          })
        );
      }

      if (
        refresh_token != null &&
        refresh_token !== cookieJar.get("refresh_token")?.value
      ) {
        cookieJar.set(
          "refresh_token",
          refresh_token,
          withSecureCookie(withDefaultProtocol(host), { expires })
        );
      }

      return response;
    }
  }

  return NextResponse.json({
    enabled: false,
    returnToQueryParam,
  });
}
