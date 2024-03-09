/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/ui"],
    },
    assetPrefix: process.env.CDN_URI != null ? new URL("/", process.env.CDN_URI).href : undefined,
    rewrites: async () => {
        const HAS_FERN_DOCS_PREVIEW = { type: "cookie", key: "_fern_docs_preview", value: "(?<host>.*)" };
        const HAS_X_FERN_HOST = { type: "header", key: "x-fern-host", value: "(?<host>.*)" };
        const HAS_HOST = { type: "host", value: "(?<host>.*)" };
        const HAS_FERN_TOKEN = { type: "cookie", key: "fern_token" };
        const PATH_STAR = "/:path*";
        return {
            beforeFiles: [
                // { source: "/:prefix*/_fern/_next/:path*", destination: "/_fern/_next/:path*" },
                { source: "/:prefix*/_next/:path*", destination: "/_next/:path*" },
                {
                    source: "/_next/data/:hash/static/:host/:path*",
                    has: [HAS_FERN_TOKEN],
                    destination: "/_next/data/:hash/dynamic/:host/:path*",
                },
                {
                    source: "/_next/data/:hash/:subpath/:oldhost/:path*",
                    has: [HAS_FERN_DOCS_PREVIEW],
                    destination: "/_next/data/:hash/:subpath/:host/:path*",
                },
            ],
            afterFiles: [
                { source: "/_next/:path*", destination: "/_next/:path*" },
                { source: "/_vercel/:path*", destination: "/_vercel/:path*" },
                { source: "/_axiom/:path*", destination: "/_axiom/:path*" },
                { source: "/robots.txt", destination: "/api/fern-docs/robots.txt" },
                { source: "/sitemap.xml", destination: "/api/fern-docs/sitemap.xml" },

                // backwards compatibility with currently deployed FDR
                { source: "/api/revalidate-all", destination: "/api/fern-docs/revalidate-all" },
            ],
            fallback: [
                {
                    has: [HAS_FERN_DOCS_PREVIEW, HAS_FERN_TOKEN],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_X_FERN_HOST, HAS_FERN_TOKEN],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_HOST, HAS_FERN_TOKEN],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_FERN_DOCS_PREVIEW, { type: "query", key: "error", value: "true" }],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_X_FERN_HOST, { type: "query", key: "error", value: "true" }],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_HOST, { type: "query", key: "error", value: "true" }],
                    source: PATH_STAR,
                    destination: "/dynamic/:host/:path*",
                },
                {
                    has: [HAS_FERN_DOCS_PREVIEW],
                    source: PATH_STAR,
                    destination: "/static/:host/:path*",
                },
                {
                    has: [HAS_X_FERN_HOST],
                    source: PATH_STAR,
                    destination: "/static/:host/:path*",
                },
                {
                    has: [HAS_HOST],
                    source: PATH_STAR,
                    destination: "/static/:host/:path*",
                },
            ],
        };
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "fdr-prod-docs-files.s3.us-east-1.amazonaws.com",
                port: "",
            },
            {
                protocol: "https",
                hostname: "fdr-dev2-docs-files.s3.us-east-1.amazonaws.com",
                port: "",
            },
        ],
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

const { withAxiom } = require("next-axiom");

module.exports = withBundleAnalyzer(withAxiom(nextConfig));
