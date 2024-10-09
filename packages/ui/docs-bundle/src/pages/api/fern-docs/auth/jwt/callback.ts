import { verifyFernJWTConfig } from "@/server/auth/FernJWT";
import { withSecureCookie } from "@/server/auth/withSecure";
import { safeUrl } from "@/server/safeUrl";
import { getXFernHostEdge, getXFernHostHeaderFallbackOrigin } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function redirectWithLoginError(location: string, errorMessage: string): NextResponse {
    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    // TODO: validate allowlist of domains to prevent open redirects
    return NextResponse.redirect(url.toString());
}

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const domain = getXFernHostEdge(req);
    const edgeConfig = await getAuthEdgeConfig(domain);

    // since we expect the callback to be redirected to, the token will be in the query params
    const token = req.nextUrl.searchParams.get(COOKIE_FERN_TOKEN);
    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = safeUrl(state) ?? withDefaultProtocol(getXFernHostHeaderFallbackOrigin(req));

    if (edgeConfig?.type !== "basic_token_verification" || token == null) {
        // eslint-disable-next-line no-console
        console.error(`Invalid config for domain ${domain}`);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        await verifyFernJWTConfig(token, edgeConfig);

        // TODO: validate allowlist of domains to prevent open redirects
        const res = NextResponse.redirect(redirectLocation);
        res.cookies.set(COOKIE_FERN_TOKEN, token, withSecureCookie());
        return res;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
