const cdnUri = process.env.NEXT_PUBLIC_CDN_URI != null ? new URL("/", process.env.NEXT_PUBLIC_CDN_URI) : undefined;

const DOCS_FILES_ALLOWLIST = [
    {
        protocol: "https",
        hostname: "fdr-prod-docs-files.s3.us-east-1.amazonaws.com",
        port: "",
    },
    {
        protocol: "https",
        hostname: "fdr-prod-docs-files-public.s3.amazonaws.com",
        port: "",
    },
    {
        protocol: "https",
        hostname: "fdr-dev2-docs-files.s3.us-east-1.amazonaws.com",
        port: "",
    },
    {
        protocol: "https",
        hostname: "fdr-dev2-docs-files-public.s3.amazonaws.com",
        port: "",
    },
];

function isTruthy(value) {
    if (value == null) {
        return false;
    } else if (typeof value === "string") {
        return value.toLowerCase() === "true" || value === "1";
    } else if (typeof value === "boolean") {
        return value;
    } else if (typeof value === "number") {
        return value > 0;
    }
    return false;
}

let SENTRY_TUNNEL_ROUTE = "/api/fern-docs/monitoring";

if (isTruthy(process.env.TRAILING_SLASH)) {
    SENTRY_TUNNEL_ROUTE += "/";
}

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: [
        "next-mdx-remote",
        "esbuild",
        "lodash-es",

        /**
         * Monorepo packages that are not transpiled by default.
         */
        "@fern-ui/core-utils",
        "@fern-api/fdr-sdk",
        "@fern-ui/components",
        "@fern-ui/ui",
    ],
    productionBrowserSourceMaps: isTruthy(process.env.ENABLE_SOURCE_MAPS),
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/ui"],

        /**
         * If the rewrite comes from another nextjs middleware,
         * x-nextjs-rewrite gets set to the external URL, and then nextjs will try to redirect to that URL.
         *
         * This flag will prevent nextjs from redirecting to the external URL.
         *
         * NOTE: @fern-api/next uses this flag to prevent the client from throwing an error.
         */
        externalMiddlewareRewritesResolve: true,
    },
    trailingSlash: isTruthy(process.env.TRAILING_SLASH),

    /**
     * This is required for posthog. See https://posthog.com/docs/advanced/proxy/nextjs-middleware
     */
    skipTrailingSlashRedirect: true,

    /**
     * Customers who opt-in for subpath routing must use rewrite rules from their hosting provider. Because of the
     * multi-tenant nature of this app, we cannot set a global basepath in the next.config.js. As a result, the `_next`
     * subpath does not exist in their hosting provider. Potentially, even, their root path is also a next.js app.
     * To avoid conflicting with the customer's app, or introduce complex rewrite rules for the customer, we must edit
     * the `assetPrefix` to point to an external URL that hosts all static assets (which we call the CDN_URI).
     * On prod, the CDN_URI is currently https://app.buildwithfern.com.
     *
     * Note that local development should not set the CDN_URI to ensure that the assets are served from the local server.
     */
    assetPrefix: cdnUri != null ? cdnUri.href : undefined,
    headers: async () => {
        const AccessControlHeaders = [
            {
                key: "Access-Control-Allow-Origin",
                value: "*",
            },
            {
                key: "Access-Control-Allow-Methods",
                value: "GET, POST, PUT, DELETE, OPTIONS",
            },
            {
                key: "Access-Control-Allow-Headers",
                value: "Content-Type, Authorization",
            },
            {
                key: "Access-Control-Allow-Credentials",
                value: "true",
            },
        ];

        return [
            {
                source: "/api/fern-docs/auth/:path*",
                headers: AccessControlHeaders,
            },
            {
                source: "/:prefix*/api/fern-docs/auth/:path*",
                headers: AccessControlHeaders,
            },

            /**
             * Access-Control-Allow-Origin header is required for sentry tunnel
             * to work across origins (i.e. subpath routing)
             */
            {
                source: SENTRY_TUNNEL_ROUTE,
                headers: [
                    { key: "Access-Control-Allow-Origin", value: "*" },
                    { key: "Access-Control-Allow-Headers", value: "sentry-trace, baggage" },
                ],
            },
        ];
    },
    images: {
        remotePatterns: DOCS_FILES_ALLOWLIST,
        path: cdnUri != null ? `${cdnUri.href}_next/image` : undefined,
    },
    webpack: (config, { isServer }) => {
        if (isServer) {
            config.externals = config.externals || [];
            config.externals.push("esbuild");
        }
        return config;
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: isTruthy(process.env.ANALYZE),
});

module.exports = withBundleAnalyzer(nextConfig);

// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
    module.exports,
    {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,
        org: "buildwithfern",
        project: "docs-frontend",
    },
    {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
        // This can increase your server load as well as your hosting bill.
        // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
        // side errors will fail.
        tunnelRoute: SENTRY_TUNNEL_ROUTE,

        // Hides source maps from generated client bundles
        hideSourceMaps: !isTruthy(process.env.ENABLE_SOURCE_MAPS),

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
    },
);
