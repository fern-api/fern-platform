import createWithBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["next-mdx-remote"],
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

const withBundleAnalyzer = createWithBundleAnalyzer({
    enabled: process.env.ANALYZE === "1",
});

export default withBundleAnalyzer(nextConfig);
