import { NextRequest, NextResponse } from "next/server";
import { withEdgeHighlight } from "../../../utils/edgeHighlight.config";

export const runtime = "edge";

async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host") ?? req.nextUrl.host;

    const hostname = new URL(`https://${xFernHost}`).hostname; // strip basepath

    if (hostname.includes(".docs.dev.buildwithfern.com") || hostname.includes(".docs.buildwithfern.com")) {
        return new NextResponse("User-Agent: *\nDisallow: /", { status: 200 });
    }

    return new NextResponse(`User-Agent: *\nSitemap: https://${hostname}/sitemap.xml`, { status: 200 });
}

export default withEdgeHighlight(GET);
