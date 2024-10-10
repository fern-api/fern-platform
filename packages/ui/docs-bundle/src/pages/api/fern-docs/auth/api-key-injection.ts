import { OAuth2Client } from "@/server/auth/OAuth2Client";
import { getAPIKeyInjectionConfig } from "@/server/auth/getApiKeyInjectionConfig";
import { withSecureCookie } from "@/server/auth/withSecure";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { APIKeyInjectionConfig, OryAccessTokenSchema } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";
import type { OauthScope } from "webflow-api/api/types/OAuthScope";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<APIKeyInjectionConfig>> {
    const domain = getDocsDomainEdge(req);
    const edgeConfig = await getAuthEdgeConfig(domain);

    // assume that if the edge config is set for webflow, api key injection is always enabled
    if (edgeConfig?.type === "oauth2" && edgeConfig.partner === "webflow") {
        const accessToken = req.cookies.get("access_token")?.value;
        if (accessToken == null) {
            return NextResponse.json({
                enabled: true,
                authenticated: false,
                url: WebflowClient.authorizeURL({
                    clientId: edgeConfig.clientId,
                    redirectUri: edgeConfig.redirectUri,

                    // note: this is not validated
                    scope: (edgeConfig.scope as OauthScope | OauthScope[]) ?? [],
                }),
            });
        }
        return NextResponse.json({
            enabled: true,
            authenticated: true,
            access_token: accessToken,
        });
    }

    const fernToken = req.cookies.get(COOKIE_FERN_TOKEN)?.value;

    const config = await getAPIKeyInjectionConfig(domain, req.cookies);
    const response = NextResponse.json(config);

    if (config.enabled && config.authenticated) {
        const expires = config.exp != null ? new Date(config.exp * 1000) : undefined;
        if (fernToken != null) {
            response.cookies.set(COOKIE_FERN_TOKEN, fernToken, withSecureCookie({ expires }));
        }

        let access_token = config.access_token;
        let refresh_token = config.refresh_token;
        let exp = expires;

        if (edgeConfig != null && edgeConfig.type === "oauth2" && edgeConfig.partner === "ory") {
            const oauthClient = new OAuth2Client(edgeConfig);

            const token = OryAccessTokenSchema.parse(await oauthClient.decode(access_token));
            exp = token.exp == null ? undefined : new Date(token.exp * 1000);
            // If access token is nullish or within 5 minutes of expiration, refresh it
            try {
                if (config.refresh_token && exp && exp < new Date(Date.now() + 1000 * 60 * 10)) {
                    const { access_token: oauth_access_token, refresh_token: oauth_refresh_token } =
                        await oauthClient.refreshToken(config.refresh_token);
                    access_token = oauth_access_token;
                    if (refresh_token != null) {
                        refresh_token = oauth_refresh_token;
                    }
                }
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);
            }
        }

        response.cookies.set("access_token", access_token, withSecureCookie({ expires: exp }));
        if (refresh_token != null) {
            response.cookies.set("refresh_token", refresh_token, withSecureCookie({ expires }));
        }
    }
    return response;
}
