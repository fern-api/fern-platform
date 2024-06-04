import { getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { NextRequest, NextResponse } from "next/server";
import { buildUrlFromApiEdge } from "../../../utils/buildUrlFromApi";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";
export const revalidate = 60 * 60 * 24;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const xFernHost = getXFernHostEdge(req);
    const headers = new Headers();
    headers.set("x-fern-host", xFernHost);

    const url = buildUrlFromApiEdge(xFernHost, req);
    const docs = await loadWithUrl(url);

    if (docs == null) {
        return new NextResponse(null, { status: 404 });
    }

    const urls = getAllUrlsFromDocsConfig(
        xFernHost,
        docs.baseUrl.basePath,
        docs.definition.config.navigation,
        docs.definition.apis,
    );

    const sitemap = getSitemapXml(urls.map((url) => `https://${url}`));

    headers.set("Content-Type", "text/xml");

    return new NextResponse(sitemap, { headers });
}

function getSitemapXml(urls: string[]): string {
    return `<?xml version="1.0" encoding="UTF-8"?> <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        ${urls
            .map((url) => {
                return `
                    <url>
                        <loc>${url}</loc>
                    </url>
                `;
            })
            .join("\n")}
    </urlset>`;
}
