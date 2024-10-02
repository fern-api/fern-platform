import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig, withSecureCookie } from "@fern-ui/ui/auth";
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

    const code = req.nextUrl.searchParams.get("code");
    const state = req.nextUrl.searchParams.get("state");
    const error = req.nextUrl.searchParams.get("error");
    const error_description = req.nextUrl.searchParams.get("error_description");
    const redirectLocation = state ?? req.nextUrl.origin;

    if (error != null) {
        return redirectWithLoginError(redirectLocation, error_description ?? error);
    }

    if (typeof code !== "string") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    const domain = getXFernHostEdge(req);
    const config = await getAuthEdgeConfig(domain);

    if (config == null || config.type !== "oauth2" || config.partner === "ory") {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        const accessToken = await WebflowClient.getAccessToken({
            clientId: config.clientId,
            clientSecret: config.clientSecret,
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
