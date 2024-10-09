import { safeUrl } from "@/server/safeUrl";
import { getXFernHostEdge, getXFernHostHeaderFallbackOrigin } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_ACCESS_TOKEN, COOKIE_FERN_TOKEN, COOKIE_REFRESH_TOKEN } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getXFernHostEdge(req);

    const authConfig = await getAuthEdgeConfig(domain);
    const logoutUrl = authConfig?.type === "basic_token_verification" ? authConfig.logout : undefined;

    const state = req.nextUrl.searchParams.get("state");

    const redirectLocation =
        safeUrl(logoutUrl) ?? safeUrl(state) ?? withDefaultProtocol(getXFernHostHeaderFallbackOrigin(req));

    const res = NextResponse.redirect(redirectLocation);
    res.cookies.delete(COOKIE_FERN_TOKEN);
    res.cookies.delete(COOKIE_ACCESS_TOKEN);
    res.cookies.delete(COOKIE_REFRESH_TOKEN);
    return res;
}
