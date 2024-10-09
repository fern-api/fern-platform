import { signFernJWT } from "@/server/auth/FernJWT";
import { OAuth2Client } from "@/server/auth/OAuth2Client";
import { withSecureCookie } from "@/server/auth/withSecure";
import { safeUrl } from "@/server/safeUrl";
import { getXFernHostEdge, getXFernHostHeaderFallbackOrigin } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernUser, OryAccessTokenSchema } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_ACCESS_TOKEN, COOKIE_FERN_TOKEN, COOKIE_REFRESH_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    // TODO: validate allowlist of domains to prevent open redirects
    return NextResponse.redirect(url.toString());
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const domain = getXFernHostEdge(req);

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = safeUrl(state) ?? withDefaultProtocol(getXFernHostHeaderFallbackOrigin(req));

    if (error != null) {
        // eslint-disable-next-line no-console
        console.error(`OAuth2 error: ${error} - ${error_description}`);
        return redirectWithLoginError(redirectLocation, error_description ?? error);
    }

    if (typeof code !== "string") {
        // eslint-disable-next-line no-console
        console.error("Missing code in query params");
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const config = await getAuthEdgeConfig(domain);

    if (config == null || config.type !== "oauth2" || config.partner !== "ory") {
        // eslint-disable-next-line no-console
        console.log(`Invalid config for domain ${domain}`);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const oauthClient = new OAuth2Client(config);
    try {
        const { access_token, refresh_token } = await oauthClient.getToken(code);
        const token = OryAccessTokenSchema.parse(await oauthClient.decode(access_token));
        const fernUser: FernUser = {
            type: "user",
            partner: "ory",
            name: token.ext?.name,
            email: token.ext?.email,
        };
        const expires = token.exp == null ? undefined : new Date(token.exp * 1000);
        // TODO: validate allowlist of domains to prevent open redirects
        const res = NextResponse.redirect(redirectLocation);
        res.cookies.set(COOKIE_FERN_TOKEN, await signFernJWT(fernUser), withSecureCookie({ expires }));
        res.cookies.set(COOKIE_ACCESS_TOKEN, access_token, withSecureCookie({ expires }));
        if (refresh_token != null) {
            res.cookies.set(COOKIE_REFRESH_TOKEN, refresh_token, withSecureCookie({ expires }));
        } else {
            res.cookies.delete(COOKIE_REFRESH_TOKEN);
        }
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error getting access token", error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
