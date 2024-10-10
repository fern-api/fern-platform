import { safeUrl } from "@/server/safeUrl";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_ACCESS_TOKEN, COOKIE_FERN_TOKEN, COOKIE_REFRESH_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getDocsDomainEdge(req);

    const authConfig = await getAuthEdgeConfig(domain);
    const logoutUrl = authConfig?.type === "basic_token_verification" ? safeUrl(authConfig.logout) : undefined;

    const state = safeUrl(req.nextUrl.searchParams.get("state"));

    // if logout url is provided, append the state to it before redirecting
    if (logoutUrl != null && state != null) {
        logoutUrl?.searchParams.set("state", state.toString());
    }

    const redirectLocation = logoutUrl ?? state ?? safeUrl(withDefaultProtocol(getHostEdge(req)));

    const res = redirectLocation ? NextResponse.redirect(redirectLocation) : NextResponse.next();
    res.cookies.delete(COOKIE_FERN_TOKEN);
    res.cookies.delete(COOKIE_ACCESS_TOKEN);
    res.cookies.delete(COOKIE_REFRESH_TOKEN);
    return res;
}
