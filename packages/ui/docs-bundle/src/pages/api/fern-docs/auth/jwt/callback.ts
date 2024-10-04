import { verifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { withSecureCookie } from "@/server/auth/withSecure";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    return NextResponse.redirect(url.toString());
}

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const domain = getXFernHostEdge(req);
    const edgeConfig = await getAuthEdgeConfig(domain);

    const token = req.nextUrl.searchParams.get("fern_token");
    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = state ?? `https://${domain}/`;

    if (edgeConfig?.type !== "basic_token_verification" || token == null) {
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        await verifyFernJWTConfig(token, edgeConfig);

        const res = NextResponse.redirect(redirectLocation);
        res.cookies.set("fern_token", token, withSecureCookie());
        return res;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
