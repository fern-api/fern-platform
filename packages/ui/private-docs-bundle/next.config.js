/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
    },
    rewrites: () => [
        {
            source: "/api/:path*",
            destination: "/api/:path*",
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
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
