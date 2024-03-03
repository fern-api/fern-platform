import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host") ?? req.nextUrl.host;

    const hostname = new URL(`https://${xFernHost}`).hostname; // strip basepath

    return new NextResponse(`User-Agent: *\nSitemap: https://${hostname}/sitemap.xml`, { status: 200 });
}
