import NextBundleAnalyzer from "@next/bundle-analyzer";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";
import process from "node:process";

const cdnUri = process.env.NEXT_PUBLIC_CDN_URI != null ? new URL("/", process.env.NEXT_PUBLIC_CDN_URI) : undefined;
const isTrailingSlashEnabled = process.env.TRAILING_SLASH === "1" || process.env.NEXT_PUBLIC_TRAILING_SLASH === "1";

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

/** @type {import("next").NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    trailingSlash: isTrailingSlashEnabled,
    transpilePackages: [
        "next-mdx-remote",
        "esbuild",
        "es-toolkit",

        /**
         * Monorepo packages that are not transpiled by default.
         *
         * pnpm list --filter=@fern-ui/docs-bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
         */
        "@fern-api/fdr-sdk",
        "@fern-api/template-resolver",
        "@fern-api/ui-core-utils",
        "@fern-ui/chatbot",
        "@fern-ui/components",
        "@fern-ui/fdr-utils",
        "@fern-ui/fern-docs-auth",
        "@fern-ui/fern-docs-edge-config",
        "@fern-ui/fern-docs-mdx",
        "@fern-ui/fern-docs-utils",
        "@fern-ui/fern-docs-search-ui",
        "@fern-ui/loadable",
        "@fern-ui/next-seo",
        "@fern-ui/react-commons",
        "@fern-ui/search-utils",
        "@fern-ui/ui",
    ],
    experimental: {
        scrollRestoration: true,
        hardNavigate404: true,
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

    skipMiddlewareUrlNormalize: true,

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
            // {
            //     source: sentryTunnelRoute,
            //     headers: [
            //         { key: "Access-Control-Allow-Origin", value: "*" },
            //         { key: "Access-Control-Allow-Headers", value: "sentry-trace, baggage" },
            //     ],
            // },
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
        config.module.rules.push({
            test: /\.(glsl|vert|frag)$/,
            exclude: /node_modules/,
            use: [
                {
                    loader: "raw-loader",
                },
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

function withVercelEnv(config) {
    return {
        ...config,
        deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? "dpl_development", // skew protection
        productionBrowserSourceMaps: process.env.VERCEL_ENV === "preview",
    };
}

/** @type {import("next").NextConfig} */
export default (phase) => {
    const isDev = phase === PHASE_DEVELOPMENT_SERVER;

    /**
     * Do not enable sentry or bundle analysis for local development.
     */
    if (isDev) {
        return withVercelEnv(nextConfig);
    }

    const withBundleAnalyzer = NextBundleAnalyzer({
        enabled: process.env.ANALYZE === "1",
    });

    return withBundleAnalyzer(withVercelEnv(nextConfig));
};
