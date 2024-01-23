import { GetServerSideProps } from "next";

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

    const hostnameAndProtocol =
        params.host === "localhost" ? "http://localhost:3000" : `https://${hostWithoutTrailingSlash}`;

    const sitemapResponse = await fetch(`${hostnameAndProtocol}/api/sitemap`, {
        headers: { "x-fern-host": xFernHost },
    });

    if (sitemapResponse.status !== 200) {
        // eslint-disable-next-line no-console
        console.error("Failed to fetch docs", sitemapResponse.status, sitemapResponse.statusText);
        return { notFound: true };
    }

    const urls: string[] = await sitemapResponse.json();

    const sitemap = getSitemapXml(urls.map((url) => `https://${hostWithoutTrailingSlash}${url}`));

    res.setHeader("Content-Type", "text/xml");
    // we send the XML to the browser
    res.write(sitemap);
    res.end();

    return { props: {} };
};
