/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === "true",
    reactProductionProfiling: process.env.ENABLE_SOURCE_MAPS === "true",
    experimental: {
        scrollRestoration: true,
    },
    reactStrictMode: true,
    images: {
        unoptimized: true,
    },
    output: "export",
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
