import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@fern-api/fdr-sdk",
    "@fern-api/ui-core-utils",
    "@fern-docs/components",
    "@fern-docs/mdx",
    "@fern-docs/search-server",
    "@fern-docs/syntax-highlighter",
    "@fern-docs/utils",
    "@fern-ui/react-commons",
  ],
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@fern-api/fdr-sdk",
      "@fern-api/ui-core-utils",
      "@fern-docs/components",
      "@fern-docs/mdx",
      "@fern-docs/search-server",
      "@fern-docs/syntax-highlighter",
      "@fern-docs/utils",
      "@fern-ui/react-commons",
    ],
    newDevOverlay: true,
    optimizeServerReact: true,
  },
};

export default nextConfig;
