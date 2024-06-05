import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost.js";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(req);

    if (
        xFernHost.includes(".docs.buildwithfern.com") ||
        xFernHost.includes(".docs.dev.buildwithfern.com") ||
        xFernHost.includes(".docs.staging.buildwithfern.com")
    ) {
        return new NextResponse("User-Agent: *\nDisallow: /", { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: https://${xFernHost}/sitemap.xml`, { status: 200 });
}
