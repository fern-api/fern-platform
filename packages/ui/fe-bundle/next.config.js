/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
    },
    assetPrefix: "/fern",
    rewrites: async () => [
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
        {
            source: "/fern/_next/:path*",
            destination: "/_next/:path*",
        },
    ],
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
