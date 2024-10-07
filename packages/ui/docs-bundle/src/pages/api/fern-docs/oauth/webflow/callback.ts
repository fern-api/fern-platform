import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { withSecureCookie } from "@/server/auth/withSecure";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { NextRequest, NextResponse } from "next/server";
import { WebflowClient } from "webflow-api";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
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
    const redirectLocation = state ?? `https://${domain}/`;

    if (error != null) {
        return redirectWithLoginError(redirectLocation, error_description ?? error);
    }

    if (typeof code !== "string") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const config = await getAuthEdgeConfig(domain);

    if (config == null || config.type !== "oauth2" || config.partner === "ory") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        const accessToken = await WebflowClient.getAccessToken({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
            redirectUri: config.redirectUri,
            code,
        });

        const res = NextResponse.redirect(redirectLocation);
        res.cookies.set("access_token", accessToken, withSecureCookie());
        return res;
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
