import { NextRequest, NextResponse } from "next/server";
import urlJoin from "url-join";
import { buildUrlFromApiEdge } from "../../../utils/buildUrlFromApi";
import { getSeoDisabled } from "../../../utils/disabledSeo";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(req);
    const sitemap = urlJoin(`https://${buildUrlFromApiEdge(xFernHost, req)}`, "/sitemap.xml");

    if (await getSeoDisabled(xFernHost)) {
        return new NextResponse("User-Agent: *\nDisallow: /\nSitemap: ${sitemap}", { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: ${sitemap}`, { status: 200 });
}
