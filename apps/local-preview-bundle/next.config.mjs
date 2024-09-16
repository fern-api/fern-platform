import createWithBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "next-mdx-remote",
        "lodash-es",

        /**
         * Monorepo packages that are not transpiled by default.
         *
         * pnpm list --filter=@fern-platform/local-preview-bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
         */
        "@fern-api/fdr-sdk",
        "@fern-api/template-resolver",
        "@fern-ui/chatbot",
        "@fern-ui/components",
        "@fern-platform/core-utils",
        "@fern-platform/fdr-utils",
        "@fern-ui/loadable",
        "@fern-ui/next-seo",
        "@fern-ui/react-utils",
        "@fern-ui/search-utils",
        "@fern-ui/docs-fe",
    ],
    productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === "true",
    reactProductionProfiling: process.env.ENABLE_SOURCE_MAPS === "true",
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/docs-fe"],
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
