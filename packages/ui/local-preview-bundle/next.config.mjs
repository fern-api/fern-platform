import createWithBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: [
        "next-mdx-remote",
        "es-toolkit",
        "three",

        /**
         * Monorepo packages that are not transpiled by default.
         *
         * pnpm list --filter=@fern-ui/local-preview-bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
         */
        "@fern-api/fdr-sdk",
        "@fern-api/template-resolver",
        "@fern-ui/components",
        "@fern-api/ui-core-utils",
        "@fern-ui/fdr-utils",
        "@fern-ui/loadable",
        "@fern-ui/next-seo",
        "@fern-ui/react-commons",
        "@fern-ui/search-utils",
        "@fern-ui/ui",
    ],
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
    webpack: (config) => {
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            exclude: /node_modules/,
            use: [
                "raw-loader",
                {
                    loader: "glslify-loader",
                    options: {
                        transform: ["glslify-import"],
                    },
                },
            ],
        });
        return config;
    },
};

const withBundleAnalyzer = createWithBundleAnalyzer({
    enabled: process.env.ANALYZE === "1",
});

export default withBundleAnalyzer(nextConfig);
