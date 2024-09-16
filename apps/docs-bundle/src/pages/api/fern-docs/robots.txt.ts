import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";
import { getSeoDisabled } from "../../../utils/disabledSeo";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(req);
    const basePath = req.nextUrl.pathname.split("/robots.txt")[0] || "";
    const sitemap = urlJoin(`https://${xFernHost}`, basePath, "/sitemap.xml");

    if (await getSeoDisabled(xFernHost)) {
        return new NextResponse(`User-Agent: *\nDisallow: /\nSitemap: ${sitemap}`, { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: ${sitemap}`, { status: 200 });
}
