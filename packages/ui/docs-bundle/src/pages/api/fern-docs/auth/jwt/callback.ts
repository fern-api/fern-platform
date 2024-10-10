import { verifyFernJWTConfig } from "@/server/auth/FernJWT";
import { withSecureCookie } from "@/server/auth/withSecure";
import { redirectWithLoginError } from "@/server/redirectWithLoginError";
import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const domain = getDocsDomainEdge(req);
    const edgeConfig = await getAuthEdgeConfig(domain);

    // since we expect the callback to be redirected to, the token will be in the query params
    const token = req.nextUrl.searchParams.get(COOKIE_FERN_TOKEN);
    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = safeUrl(state) ?? safeUrl(withDefaultProtocol(getHostEdge(req)));

    if (edgeConfig?.type !== "basic_token_verification" || token == null) {
        // eslint-disable-next-line no-console
        console.error(`Invalid config for domain ${domain}`);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }

    try {
        await verifyFernJWTConfig(token, edgeConfig);

        // TODO: validate allowlist of domains to prevent open redirects
        const res = redirectLocation ? NextResponse.redirect(redirectLocation) : NextResponse.next();
        res.cookies.set(COOKIE_FERN_TOKEN, token, withSecureCookie());
        return res;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return redirectWithLoginError(redirectLocation, "Couldn't login, please try again");
    }
}
