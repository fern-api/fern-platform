import { getXFernHostEdge } from "@/server/xfernhost/edge";
import {
    APIKeyInjectionConfig,
    OAuth2Client,
    OryAccessTokenSchema,
    getAPIKeyInjectionConfig,
    getAuthEdgeConfig,
    withSecureCookie,
} from "@fern-ui/ui/auth";
import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<APIKeyInjectionConfig>> {
    const domain = getXFernHostEdge(req);
    const fern_token = req.cookies.get("fern_token")?.value;

    const config = await getAPIKeyInjectionConfig(domain, req.cookies);
    const edgeConfig = await getAuthEdgeConfig(domain);
    const response = NextResponse.json(config);

    if (config.enabled && config.authenticated) {
        const expires = config.exp != null ? new Date(config.exp * 1000) : undefined;
        if (fern_token != null) {
            response.cookies.set("fern_token", fern_token, withSecureCookie({ expires }));
        }

        let access_token = config.access_token;
        let refresh_token = config.refresh_token;
        let exp = expires;

        if (edgeConfig != null && edgeConfig.type === "oauth2" && edgeConfig.partner === "ory") {
            const oauthClient = new OAuth2Client(edgeConfig, urlJoin(`https://${domain}/api/auth/callback`));

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
