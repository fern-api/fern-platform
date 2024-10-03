import { checkViewerAllowedEdge } from "@/server/auth/checkViewerAllowed";
import { buildUrlFromApiEdge } from "@/server/buildUrlFromApi";
import { loadWithUrl } from "@/server/loadWithUrl";
import { conformTrailingSlash } from "@/server/trailingSlash";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
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

    if (!docs.ok) {
        return new NextResponse(null, { status: 404 });
    }

    const node = FernNavigation.utils.toRootNode(docs.body);
    const collector = NodeCollector.collect(node);
    const urls = collector.indexablePageSlugs.map((slug) => urljoin(xFernHost, slug));

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
