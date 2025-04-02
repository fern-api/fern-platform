/* eslint-disable turbo/no-undeclared-env-vars */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    /**
     * Monorepo packages that are not transpiled by default.
     *
     * pnpm list --filter=@fern-dashboard/ui --only-projects --prod --recursive --depth=Infinity --json | jq -r '[.. | objects | select(.version | .!=null) | select(.version | startswith("link:")) | .from] | unique'
     */
    "@fern-api/fdr-sdk",
    "@fern-ui/loadable",
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
      {
        protocol: "https",
        hostname: `${process.env.HOMEPAGE_IMAGES_S3_BUCKET_NAME}.s3.us-east-1.amazonaws.com`,
        port: "",
        pathname: "/**",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.externals.push("sharp");
    return webpackConfig;
  },

  // vercel chokes on monorepo compilation and we run compile before building
  typescript: { ignoreBuildErrors: true },

  // so it doesn't cover the theme toggle
  devIndicators: { position: "bottom-right" },
};

export default nextConfig;
