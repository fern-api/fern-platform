/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
    },
    assetPrefix: process.env.CDN_URI != null ? new URL("/_fern", process.env.CDN_URI).href : "/_fern",
    rewrites: async () => ({
        beforeFiles: [
            {
                source: "/_fern/_next/:path*",
                destination: "/_next/:path*",
            },
            {
                source: `/_fern/images/:query*`,
                destination: "/_next/image/:query*",
            },
            {
                source: `/_fern/api/:path*`,
                destination: "/api/:path*",
            },
        ],
        afterFiles: [
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
    webpack: (config) => {
        // camelCase style names from css modules
        // see: https://stackoverflow.com/questions/74038400/convert-css-module-kebab-case-class-names-to-camelcase-in-next-js
        const rules = config.module.rules
            .find((rule) => typeof rule.oneOf === "object")
            .oneOf.filter((rule) => Array.isArray(rule.use));
        rules.forEach((rule) => {
            rule.use.forEach((moduleLoader) => {
                if (
                    moduleLoader.loader !== undefined &&
                    moduleLoader.loader.includes("css-loader") &&
                    typeof moduleLoader.options.modules === "object"
                ) {
                    moduleLoader.options = {
                        ...moduleLoader.options,
                        modules: {
                            ...moduleLoader.options.modules,
                            // This is where we allow camelCase class names
                            exportLocalsConvention: "camelCase",
                        },
                    };
                }
            });
        });

        return config;
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
