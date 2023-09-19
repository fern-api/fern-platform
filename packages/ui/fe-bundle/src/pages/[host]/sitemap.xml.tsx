import { GetServerSideProps } from "next";
import { REGISTRY_SERVICE } from "../../service";
import { getPathsToRevalidate } from "../../utils/revalidation/getPathsToRevalidate";

export declare namespace Sitemap {
    export interface Props {
        urls: string[];
    }
}

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

export const getServerSideProps: GetServerSideProps = async ({ params = {}, res }) => {
    const host = params.host as string | undefined;

    if (host == null) {
        throw new Error("host is not defined");
    }
    const hostWithoutTrailingSlash = host.endsWith("/") ? host.slice(0, -1) : host;

    const docs = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl({
        url: process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? hostWithoutTrailingSlash,
    });

    if (!docs.ok) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", docs.error);
        return {
            notFound: true,
            revalidate: false,
        };
    }

    const paths = getPathsToRevalidate({
        navigationConfig: docs.body.definition.config.navigation,
        docsDefinition: docs.body.definition,
    });

    const urls = paths.map((path) => {
        return `https://${hostWithoutTrailingSlash}${path}`;
    });
    const sitemap = getSitemapXml(urls);

    res.setHeader("Content-Type", "text/xml");
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
};
