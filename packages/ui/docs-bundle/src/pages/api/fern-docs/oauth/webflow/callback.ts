import { withSecureCookie } from "@/server/auth/with-secure-cookie";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const domain = getDocsDomainEdge(req);
    const host = getHostEdge(req);

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = safeUrl(state) ?? safeUrl(withDefaultProtocol(host));

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

    if (config == null || config.type !== "oauth2" || config.partner !== "webflow") {
        // eslint-disable-next-line no-console
        console.log(`Invalid config for domain ${domain}`);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        const accessToken = await WebflowClient.getAccessToken({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            redirectUri: config.redirectUri,
            code,
        });

        // TODO: validate allowlist of domains to prevent open redirects
        const res = redirectLocation ? NextResponse.redirect(redirectLocation) : NextResponse.next();
        res.cookies.set("access_token", accessToken, withSecureCookie(withDefaultProtocol(host)));
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error("Error getting access token", error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
