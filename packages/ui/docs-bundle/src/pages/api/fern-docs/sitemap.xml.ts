import { buildUrl, getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse, notFoundResponse } from "../../../utils/serverResponse";

/**
 * sitemap.xml generates a sitemap for the given host. This endpoint is used by search engines to index the site.
 * We cache this response for 24 hours to avoid unnecessary load on the server. Since SEO is slow to update, this is acceptable.
 */

export const runtime = "edge";
export const revalidate = 60 * 60 * 24; // 24 hours

function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }
    const urlObj = new URL(url);
    return urlObj.host;
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    let xFernHost = req.headers.get("x-fern-host") ?? getHostFromUrl(req.nextUrl.href);

    if (xFernHost?.includes("localhost")) {
        xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN;
    }

    if (xFernHost == null || Array.isArray(xFernHost)) {
        return notFoundResponse();
    }

    const docs = await loadWithUrl(buildUrl({ host: xFernHost }));

    if (docs == null) {
        return jsonResponse(404, []);
    }

    const urls = getAllUrlsFromDocsConfig(
        xFernHost,
        docs.baseUrl.basePath,
        docs.definition.config.navigation,
        docs.definition.apis,
    );

    const sitemap = getSitemapXml(urls.map((url) => `https://${url}`));

    return new NextResponse(sitemap, {
        headers: {
            "Content-Type": "text/xml",
        },
    });
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
