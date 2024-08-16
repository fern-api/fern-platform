/* eslint-disable import/no-internal-modules */
import { getAuthEdgeConfig } from "@fern-ui/ui/auth";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../../utils/xFernHost";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getXFernHostEdge(req);
    const config = await getAuthEdgeConfig(domain);

    const res = NextResponse.redirect(req.nextUrl.origin);
    if (config != null && config.type === "oauth2" && config.partner === "ory") {
        res.cookies.delete("fern_token");
        res.cookies.delete("access_token");
        res.cookies.delete("refresh_token");
    }
    return res;
}
