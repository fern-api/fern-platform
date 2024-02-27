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
        ],
        afterFiles: [
            {
                source: "/_next/:path*",
                destination: "/_next/:path*",
            },
            ...[
                "proxy",
                "revalidate-all",
                "revalidate-v2",
                "revalidate",
                "serialize-mdx",
                "sitemap",
                "resolve-api",
            ].map((prefix) => ({
                source: `/api/${prefix}`,
                destination: `/api/${prefix}`,
            })),
            {
                has: [
                    {
                        type: "header",
                        key: "x-fern-host",
                        value: "(?<host>.*)",
                    },
                ],
                source: "/:path*",
                destination: "/:host/:path*",
            },
            {
                has: [
                    {
                        type: "host",
                        value: "(?<host>.*)",
                    },
                ],
                source: "/:path*",
                destination: "/:host/:path*",
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

module.exports = withBundleAnalyzer(nextConfig);
