import { NextRequest, NextResponse } from "next/server";
import { getSeoDisabled } from "../../../utils/disabledSeo";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(req);

    if (await getSeoDisabled(xFernHost)) {
        return new NextResponse("User-Agent: *\nDisallow: /", { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: https://${xFernHost}/sitemap.xml`, { status: 200 });
}
