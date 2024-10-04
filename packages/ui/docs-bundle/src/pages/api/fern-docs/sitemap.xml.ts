import { checkViewerAllowedEdge } from "@/server/auth/checkViewerAllowed";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { buildUrlFromApiEdge } from "@/server/buildUrlFromApi";
import { loadWithUrl } from "@/server/loadWithUrl";
import { conformTrailingSlash } from "@/server/trailingSlash";
import { pruneWithBasicTokenViewAllowed } from "@/server/withBasicTokenViewAllowed";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-ui/core-utils";
import { NextRequest, NextResponse } from "next/server";
import urljoin from "url-join";

export const runtime = "edge";
export const revalidate = 60 * 60 * 24;

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const xFernHost = getXFernHostEdge(req);
    const auth = await getAuthEdgeConfig(xFernHost);

    const status = await checkViewerAllowedEdge(auth, req);
    if (status >= 400) {
        return NextResponse.next({ status });
    }

    const url = buildUrlFromApiEdge(xFernHost, req);
    const docs = await loadWithUrl(url);

    if (!docs.ok) {
        return new NextResponse(null, { status: 404 });
    }

    let node = FernNavigation.utils.toRootNode(docs.body);

    // If the domain is basic_token_verification, we only want to include slugs that are allowed
    if (auth?.type === "basic_token_verification") {
        node = pruneWithBasicTokenViewAllowed(node, auth.allowlist);
    }

    const collector = NodeCollector.collect(node);
    const slugs = collector.indexablePageSlugs;

    const urls = slugs.map((slug) => conformTrailingSlash(urljoin(withDefaultProtocol(xFernHost), slug)));
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
