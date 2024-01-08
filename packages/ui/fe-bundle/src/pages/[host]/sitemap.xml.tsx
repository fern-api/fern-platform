import { FdrAPI, PathResolver } from "@fern-api/fdr-sdk";
import { GetServerSideProps } from "next";
import { REGISTRY_SERVICE } from "../../service";

function SiteMap(): void {
    // getServerSideProps will do the heavy lifting
}

export default SiteMap;

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

export const getServerSideProps: GetServerSideProps = async ({ params = {}, req, res }) => {
    const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers["x-fern-host"] ?? params.host;

    if (xFernHost == null || Array.isArray(xFernHost)) {
        return { notFound: true };
    }
    const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;

    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: hostWithoutTrailingSlash,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return { notFound: true };
    }

    type ApiDefinition = FdrAPI.api.v1.read.ApiDefinition;
    const resolver = new PathResolver({
        definition: {
            apis: docs.body.definition.apis as Record<ApiDefinition["id"], ApiDefinition>,
            docsConfig: docs.body.definition.config,
        },
    });

    const urls = resolver.getAllSlugsWithBaseURL(hostWithoutTrailingSlash);
    const sitemap = getSitemapXml(urls);

    res.setHeader("Content-Type", "text/xml");
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return { props: {} };
};
