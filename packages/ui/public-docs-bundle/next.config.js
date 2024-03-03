/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/ui"],
    },
    assetPrefix: process.env.CDN_URI != null ? new URL("/_fern", process.env.CDN_URI).href : "/_fern",
    rewrites: async () => ({
        beforeFiles: [
            {
                source: "/:prefix*/_next/:path*",
                destination: "/_next/:path*",
            },
            {
                source: "/_next/data/:hash/:subpath/:oldhost/:path*",
                has: [
                    {
                        type: "cookie",
                        key: "_fern_docs_preview",
                        value: "(?<host>.*)",
                    },
                ],
                destination: "/_next/data/:hash/:subpath/:host/:path*",
            },
        ],
        afterFiles: [
            {
                source: "/_next/:path*",
                destination: "/_next/:path*",
            },
            {
                source: "/_vercel/:path*",
                destination: "/_vercel/:path*",
            },
            {
                source: "/robots.txt",
                destination: "/api/robots.txt",
            },
            {
                source: "/sitemap.xml",
                destination: "/api/sitemap.xml",
            },
            ...[
                "proxy",
                "revalidate-all",
                "revalidate-v2",
                "serialize-mdx",
                "sitemap",
                "resolve-api",
                "robots.txt",
                "sitemap.xml",
            ].map((prefix) => ({
                source: `/api/${prefix}`,
                destination: `/api/${prefix}`,
            })),
            {
                has: [
                    {
                        type: "cookie",
                        key: "_fern_docs_preview",
                        value: "(?<host>.*)",
                    },
                    {
                        type: "query",
                        key: "error",
                        value: "true",
                    },
                ],
                source: "/:path*",
                destination: "/dynamic/:host/:path*",
            },
            {
                has: [
                    {
                        type: "header",
                        key: "x-fern-host",
                        value: "(?<host>.*)",
                    },
                    {
                        type: "query",
                        key: "error",
                        value: "true",
                    },
                ],
                source: "/:path*",
                destination: "/dynamic/:host/:path*",
            },
            {
                has: [
                    {
                        type: "host",
                        value: "(?<host>.*)",
                    },
                    {
                        type: "query",
                        key: "error",
                        value: "true",
                    },
                ],
                source: "/:path*",
                destination: "/dynamic/:host/:path*",
            },
            {
                has: [
                    {
                        type: "cookie",
                        key: "_fern_docs_preview",
                        value: "(?<host>.*)",
                    },
                ],
                source: "/:path*",
                destination: "/static/:host/:path*",
            },
            {
                has: [
                    {
                        type: "header",
                        key: "x-fern-host",
                        value: "(?<host>.*)",
                    },
                ],
                source: "/:path*",
                destination: "/static/:host/:path*",
            },
            {
                has: [
                    {
                        type: "host",
                        value: "(?<host>.*)",
                    },
                ],
                source: "/:path*",
                destination: "/static/:host/:path*",
            },
        ],
    }),
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
