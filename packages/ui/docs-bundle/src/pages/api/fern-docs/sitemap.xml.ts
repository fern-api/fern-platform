import { DocsLoader } from "@/server/DocsLoader";
import { conformTrailingSlash } from "@/server/trailingSlash";
import { withPrunedNavigation } from "@/server/withPrunedNavigation";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { NextRequest, NextResponse } from "next/server";
import urljoin from "url-join";

export const runtime = "edge";
export const revalidate = 60 * 60 * 24;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const domain = getDocsDomainEdge(req);
    const host = getHostEdge(req);

    // load the root node, and prune it— sitemap should only include public routes
    const root = withPrunedNavigation(await DocsLoader.for(domain, host).root(), { authed: false });

    // collect all indexable page slugs
    const slugs = NodeCollector.collect(root).indexablePageSlugs;

    // convert slugs to full urls
    const urls = slugs.map((slug) => conformTrailingSlash(urljoin(withDefaultProtocol(domain), slug)));

    // generate sitemap xml
    const sitemap = getSitemapXml(urls);

    const headers = new Headers();
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
