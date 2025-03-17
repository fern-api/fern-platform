import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Note: this is a required config if you are using middleware rewrites on the reverse-proxy side
    // because otherwise, the fern docs client-side will be unable to resolve the original path.
    externalMiddlewareRewritesResolve: true,
  },
};

export default nextConfig;
