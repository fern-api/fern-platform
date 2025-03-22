/* eslint-disable turbo/no-undeclared-env-vars */
import type { NextConfig } from "next";

// @ts-expect-error there are no types for this library
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";

const nextConfig: NextConfig = {
  transpilePackages: [
    /**
     * Monorepo packages that are not transpiled by default.
     *
     * pnpm list --filter=@fern-dashboard/ui --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
     */
    "@fern-platform/fdr",
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
    APP_BASE_URL:
      process.env.VERCEL_ENV === "preview"
        ? `https://${process.env.VERCEL_BRANCH_URL}`
        : process.env.APP_BASE_URL,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
};

export default nextConfig;
