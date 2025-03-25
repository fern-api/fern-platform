import { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

import NextBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

const cdnUri =
  process.env.NEXT_PUBLIC_CDN_URI != null
    ? new URL("/", process.env.NEXT_PUBLIC_CDN_URI)
    : undefined;
const isTrailingSlashEnabled = process.env.NEXT_PUBLIC_TRAILING_SLASH === "1";

// TODO: move this to a shared location (this is copied in FernImage.tsx)
const NEXT_IMAGE_HOSTS = [
  "fdr-prod-docs-files.s3.us-east-1.amazonaws.com",
  "fdr-prod-docs-files-public.s3.amazonaws.com",
  "fdr-dev2-docs-files.s3.us-east-1.amazonaws.com",
  "fdr-dev2-docs-files-public.s3.amazonaws.com",
  "files.buildwithfern.com",
  "files-dev2.buildwithfern.com",
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  trailingSlash: isTrailingSlashEnabled,
  transpilePackages: [
    "es-toolkit",
    "three",

    /**
     * Monorepo packages that are not transpiled by default.
     *
     * pnpm list --filter=@fern-docs/bundle --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
     */
    "@fern-api/fdr-sdk",
    "@fern-api/template-resolver",
    "@fern-api/ui-core-utils",
    "@fern-docs/auth",
    "@fern-docs/components",
    "@fern-docs/edge-config",
    "@fern-docs/mdx",
    "@fern-docs/search-server",
    "@fern-docs/search-ui",
    "@fern-docs/utils",
    "@fern-platform/fdr-utils",
    "@fern-ui/loadable",
    "@fern-ui/react-commons",
  ],
  experimental: {
    appNavFailHandling: true,
    scrollRestoration: true,
    optimisticClientCache: true,
    optimizePackageImports: [
      "@fern-api/fdr-sdk",
      "@fern-docs/mdx",
      "@fern-docs/components",
      "@fern-docs/search-server",
      "es-toolkit",
      "ts-essentials",
      "lucide-react",

      /**
       * optimize imports for all rehype and unist related packages.
       */
      "@mdx-js/esbuild",
      "@mdx-js/mdx",
      "@mdx-js/react",
      "estree-util-is-identifier-name",
      "estree-util-value-to-estree",
      "estree-walker",
      "rehype-katex",
      "remark-frontmatter",
      "remark-gemoji",
      "remark-gfm",
      "remark-math",
      "remark-mdx-frontmatter",
      "remark-smartypants",
      "remark-squeeze-paragraphs",
    ],
    optimizeServerReact: Boolean(process.env.VERCEL),
    authInterrupts: true,
    swcTraceProfiling: true,
    webpackBuildWorker: true,
    parallelServerCompiles: true,
    parallelServerBuildTraces: true,
    webpackMemoryOptimizations: true,
    taint: true,
    useCache: true,
    staleTimes: {
      dynamic: 180,
      static: 180,
    },
    serverComponentsHmrCache: true,
    serverActions: {
      allowedOrigins: ["*"],
    },
  },
  expireTime: 3600, // 1 hour

  // speed up build
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

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
   * On prod, the CDN_URI is currently https://legacy.ferndocs.com.
   *
   * Note that local development should not set the CDN_URI to ensure that the assets are served from the local server.
   */
  assetPrefix: cdnUri != null ? cdnUri.href : undefined,
  compiler: {
    // Note: i think this removes console logs in server-side code?
    // removeConsole:
    //   process.env.VERCEL_ENV === "production"
    //     ? { exclude: ["error", "log"] }
    //     : false,
    styledJsx: true,
  },
  logging: {
    fetches: {
      fullUrl: true,
      //   hmrRefreshes: true,
    },
    incomingRequests: true,
  },
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

    const searchV2Headers = [
      {
        key: "Access-Control-Allow-Origin",
        value: "*",
      },
      {
        key: "Access-Control-Allow-Methods",
        value: "POST, OPTIONS",
      },
      {
        key: "Access-Control-Allow-Headers",
        value: "*",
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
        source: "/:prefix*/api/fern-docs/search/v2/:path*",
        headers: searchV2Headers,
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
    remotePatterns: NEXT_IMAGE_HOSTS.map((host) => ({
      protocol: "https",
      hostname: host,
    })),
    path: cdnUri != null ? `${cdnUri.href}_next/image` : undefined,
  },
  serverExternalPackages: ["vscode-oniguruma", "esbuild", "@typescript/vfs"],
  webpack: (config, { isServer }) => {
    // config.optimization = {
    //   ...config.optimization,
    //   minimize: false,
    // };
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("esbuild");
      config.externals.push("vscode-oniguruma");
      config.externals.push("@typescript/vfs");
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
    };
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

function withVercelEnv(config: NextConfig): NextConfig {
  return {
    ...config,
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID, // skew protection
    productionBrowserSourceMaps: false,
    reactProductionProfiling: false,
    experimental: {
      ...config.experimental,
      serverSourceMaps: false,
    },
  };
}

export default (phase: string): NextConfig => {
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
