/* eslint-disable turbo/no-undeclared-env-vars */
import type { NextConfig } from "next";

const APP_BASE_URL =
  process.env.VERCEL_ENV === "preview"
    ? `https://${process.env.VERCEL_BRANCH_URL}`
    : process.env.NEXT_PUBLIC_APP_BASE_URL;

const nextConfig: NextConfig = {
  transpilePackages: [
    /**
     * Monorepo packages that are not transpiled by default.
     *
     * pnpm list --filter=@fern-dashboard/ui --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
     */
    "@fern-api/fdr-sdk",
  ],
  experimental: {
    optimizePackageImports: [],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        port: "",
        pathname: "/u/**",
        search: "?v=4",
      },
    ],
  },
  env: {
    // need this to be NEXT_PUBLIC_ so it's accessible in auth0.ts
    NEXT_PUBLIC_APP_BASE_URL: APP_BASE_URL,

    // Auth0 expects APP_BASE_URL to exist.
    APP_BASE_URL,
  },
  webpack: (webpackConfig) => {
    webpackConfig.externals.push("sharp");
    return webpackConfig;
  },

  // vercel chokes on monorepo compilation and we run compile before building
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
