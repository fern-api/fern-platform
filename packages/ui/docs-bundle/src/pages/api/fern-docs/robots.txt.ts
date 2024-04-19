import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost";
import { getFeatureFlags } from "./feature-flags";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(req);

    const { isSeoDisabled } = await getFeatureFlags(xFernHost);

    if (isSeoDisabled) {
        return new NextResponse("User-Agent: *\nDisallow: /", { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: https://${xFernHost}/sitemap.xml`, { status: 200 });
}
