import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import {
    buildUrlFromApiEdge,
    checkViewerAllowedEdge,
    conformTrailingSlash,
    getXFernHostEdge,
    loadWithUrl,
} from "@fern-ui/docs-server";
import { NextRequest, NextResponse } from "next/server";
import urljoin from "url-join";

export const runtime = "edge";
export const revalidate = 60 * 60 * 24;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const xFernHost = getXFernHostEdge(req);

    const status = await checkViewerAllowedEdge(xFernHost, req);
    if (status >= 400) {
        return NextResponse.next({ status });
    }

    const headers = new Headers();
    headers.set("x-fern-host", xFernHost);

    const url = buildUrlFromApiEdge(xFernHost, req);
    const docs = await loadWithUrl(url);

    if (docs == null) {
        return new NextResponse(null, { status: 404 });
    }

    const node = FernNavigation.utils.convertLoadDocsForUrlResponse(docs);
    const slugCollector = NodeCollector.collect(node);
    const urls = slugCollector.getIndexablePageSlugs().map((slug) => urljoin(xFernHost, slug));

    const sitemap = getSitemapXml(urls.map((url) => conformTrailingSlash(`https://${url}`)));

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
