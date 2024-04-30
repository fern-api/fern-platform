const assetPrefix = process.env.CDN_URI != null ? new URL("/", process.env.CDN_URI).href : undefined;
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === "true",
    experimental: {
        scrollRestoration: true,
        optimizePackageImports: ["@fern-ui/ui"],
    },
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
    assetPrefix,
    // rewrites: async () => {
    //     const HAS_FERN_DOCS_PREVIEW = { type: "cookie", key: "_fern_docs_preview", value: "(?<host>.*)" };
    //     const HAS_X_FERN_HOST = { type: "header", key: "x-fern-host", value: "(?<host>.*)" };
    //     const HAS_HOST = { type: "host", value: "(?<host>.*)" };

    //     // The order of the following array is important. The first match will be used.
    //     const WITH_MATCHED_HOST = [HAS_FERN_DOCS_PREVIEW, HAS_X_FERN_HOST, HAS_HOST];

    //     const HAS_FERN_TOKEN = { type: "cookie", key: "fern_token" };
    //     const THREW_ERROR = { type: "query", key: "error", value: "true" };
    //     const PATH_STAR = "/:path*";
    //     return {
    //         beforeFiles: [
    //             /**
    //              * while /_next/static routes are handled by the assetPrefix config, we need to handle the /_next/data routes separately
    //              * when the user is hovering over a link, Next.js will prefetch the data route using `/_next/data` routes. We intercept
    //              * the prefetch request at packages/ui/app/src/next-app/NextApp.tsx and append the customer-defined basepath:
    //              *
    //              * i.e. /base/path/_next/data/*
    //              *
    //              * This rewrite rule will ensure that /base/path/_next/data/* is rewritten to /_next/data/* on the server
    //              */
    //             { source: "/:prefix*/_next/:path*", destination: "/_next/:path*" },
    //             { source: "/:prefix*/api/fern-docs/:path*", destination: "/api/fern-docs/:path*" },
    //             /**
    //              * Since we use cookie rewrites to determine if the path should be rewritten to /static or /dynamic, prefetch requests
    //              * do not have access to these cookies, and will always be matched to /static. This rewrite rule will ensure that
    //              * when the fern_token cookie is present, the /static route will be rewritten to /dynamic
    //              */
    //             {
    //                 source: "/_next/data/:hash/static/:host/:path*",
    //                 has: [HAS_FERN_TOKEN],
    //                 destination: "/_next/data/:hash/dynamic/:host/:path*",
    //             },
    //             /**
    //              * This rewrite rule will ensure that when the `_fern_docs_preview` cookie is present, the /_next/data route will be
    //              * rewritten to the host specified in the cookie. This is necessary for the PR Preview feature to work.
    //              */
    //             {
    //                 source: "/_next/data/:hash/:subpath/:oldhost/:path*",
    //                 has: [HAS_FERN_DOCS_PREVIEW],
    //                 destination: "/_next/data/:hash/:subpath/:host/:path*",
    //             },
    //         ],
    //         afterFiles: [
    //             { source: "/_next/:path*", destination: "/_next/:path*" },
    //             { source: "/_vercel/:path*", destination: "/_vercel/:path*" },
    //             { source: "/robots.txt", destination: "/api/fern-docs/robots.txt" },
    //             { source: "/sitemap.xml", destination: "/api/fern-docs/sitemap.xml" },

    //             // backwards compatibility with currently deployed FDR
    //             { source: "/api/revalidate-all", destination: "/api/fern-docs/revalidate-all" },
    //         ],
    //         fallback: [
    //             /**
    //              * The following rewrite rules are used to determine if the path should be rewritten to /static or /dynamic
    //              * On the presence of fern_token, or if the query contains error=true, the path will be rewritten to /dynamic
    //              */
    //             ...WITH_MATCHED_HOST.map((HOST_RULE) => ({
    //                 has: [HOST_RULE, HAS_FERN_TOKEN],
    //                 source: PATH_STAR,
    //                 destination: "/dynamic/:host/:path*",
    //             })),
    //             ...WITH_MATCHED_HOST.map((HOST_RULE) => ({
    //                 has: [HOST_RULE, THREW_ERROR],
    //                 source: PATH_STAR,
    //                 destination: "/dynamic/:host/:path*",
    //             })),
    //             ...WITH_MATCHED_HOST.map((HOST_RULE) => ({
    //                 has: [HOST_RULE],
    //                 source: PATH_STAR,
    //                 destination: "/static/:host/:path*",
    //             })),
    //         ],
    //     };
    // },
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
        path: assetPrefix != null ? `${assetPrefix}_next/image` : undefined,
    },
    env: {
        VERSION: process.env.VERSION,
    },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
    enabled: process.env.ANALYZE === "true",
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
        tunnelRoute: "/monitoring",

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,

        // Enables automatic instrumentation of Vercel Cron Monitors.
        // See the following for more information:
        // https://docs.sentry.io/product/crons/
        // https://vercel.com/docs/cron-jobs
        automaticVercelMonitors: true,
    },
);
