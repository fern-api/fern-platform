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

const DOCS_FILES_URLS = DOCS_FILES_ALLOWLIST.map(
    ({ protocol, hostname, port }) => `${protocol}://${hostname}${port ? `:${port}` : ""}`,
);

/** @type {import('next').NextConfig} */

const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ["next-mdx-remote", "esbuild", "jotai-devtools", "@fern-ui/components"],
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
    assetPrefix: cdnUri != null ? cdnUri.href : undefined,
    headers: async () => {
        const defaultSrc = ["'self'", "https://*.buildwithfern.com", "https://*.ferndocs.com", ...DOCS_FILES_URLS];

        const connectSrc = [
            "'self'",
            "https://*.buildwithfern.com",
            "https://*.ferndocs.com",
            "wss://websocket.proxy.ferndocs.com",
            "https://*.algolia.net",
            "https://*.algolianet.com",
            "https://*.algolia.io",
            "https://*.posthog.com",
            "https://cdn.segment.com",
            "https://api.segment.io",
            "https://browser-intake-datadoghq.com",
            "wss://api.getkoala.com",
            "https://www.google-analytics.com",
        ];

        const scriptSrc = [
            "'self'",
            "'unsafe-eval'",
            "'unsafe-inline'",
            "https://*.posthog.com",
            "https://cdn.segment.com",
            "https://www.googletagmanager.com",
            ...DOCS_FILES_URLS,
        ];

        const styleSrc = ["'self'", "'unsafe-inline'"];

        if (cdnUri != null) {
            scriptSrc.push(`${cdnUri.origin}`);
            connectSrc.push(`${cdnUri.origin}`);
            styleSrc.push(`${cdnUri.origin}`);
        }

        // enable vercel toolbar
        scriptSrc.push("https://vercel.live");
        connectSrc.push("https://vercel.live");
        connectSrc.push("wss://*.pusher.com");
        styleSrc.push("https://vercel.live");
        styleSrc.push("https://fonts.googleapis.com");

        const ContentSecurityPolicy = [
            `default-src ${defaultSrc.join(" ")}`,
            `script-src ${scriptSrc.join(" ")}`,
            `style-src ${styleSrc.join(" ")}`,
            "img-src 'self' https: blob: data:",
            `connect-src ${connectSrc.join(" ")}`,
            "frame-src 'self' https:",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'none'",
            // "upgrade-insecure-requests", <-- this is ignored because Report-Only mode is enabled
        ];

        const reportUri =
            "https://o4507138224160768.ingest.sentry.io/api/4507148139495424/security/?sentry_key=216ad381a8f652e036b1833af58627e5";

        const ReportTo = `{"group":"csp-endpoint","max_age":10886400,"endpoints":[{"url":"${reportUri}"}],"include_subdomains":true}`;

        ContentSecurityPolicy.push("worker-src 'self' blob:");

        ContentSecurityPolicy.push(`report-uri ${reportUri}`);
        ContentSecurityPolicy.push("report-to csp-endpoint");

        const ContentSecurityHeaders = [
            { key: "Content-Security-Policy-Report-Only", value: ContentSecurityPolicy.join("; ") },
            { key: "Report-To", value: ReportTo },
        ];

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
            {
                source: "/:path*",
                headers: ContentSecurityHeaders,
            },
        ];
    },
    rewrites: async () => ({
        beforeFiles: [
            { source: "/:prefix*/_next/:path*", destination: "/_next/:path*" },
            { source: "/_next/:path*", destination: "/_next/:path*" },
        ],
        fallback: [
            {
                source: "/",
                has: [
                    { type: "header", key: "x-fern-host", value: "(?<host>.*)" },
                    { type: "header", key: "x-fern-dynamic", value: "1" },
                ],
                destination: "/static/:host",
            },
            {
                source: "/",
                has: [{ type: "header", key: "x-fern-host", value: "(?<host>.*)" }],
                destination: "/static/:host",
            },
            {
                source: "/:path*",
                has: [
                    { type: "header", key: "x-fern-host", value: "(?<host>.*)" },
                    { type: "header", key: "x-fern-dynamic", value: "1" },
                ],
                destination: "/static/:host/:path*",
            },
            {
                source: "/:path*",
                has: [{ type: "header", key: "x-fern-host", value: "(?<host>.*)" }],
                destination: "/static/:host/:path*",
            },
        ],
    }),
    images: {
        remotePatterns: DOCS_FILES_ALLOWLIST,
        path: cdnUri != null ? `${cdnUri.href}_next/image` : undefined,
    },
    env: {
        VERSION: process.env.VERSION,
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
        tunnelRoute: "/api/fern-docs/monitoring",

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
