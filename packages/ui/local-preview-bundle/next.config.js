/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["next-mdx-remote", "jotai-devtools"],
    productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === "true",
    reactProductionProfiling: process.env.ENABLE_SOURCE_MAPS === "true",
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/ui"],
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
