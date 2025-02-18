import type { NextConfig } from "next";

import createWithBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@fortawesome/fontawesome-svg-core",
    "@fortawesome/free-brands-svg-icons",
    "@fortawesome/pro-duotone-svg-icons",
    "@fortawesome/pro-light-svg-icons",
    "@fortawesome/pro-regular-svg-icons",
    "@fortawesome/pro-solid-svg-icons",
    "@fortawesome/pro-thin-svg-icons",
    "@fortawesome/sharp-light-svg-icons",
    "@fortawesome/sharp-regular-svg-icons",
    "@fortawesome/sharp-solid-svg-icons",
    "@fortawesome/sharp-thin-svg-icons",
  ],
};

const withBundleAnalyzer = createWithBundleAnalyzer({
  enabled: process.env.ANALYZE === "1",
});

export default withBundleAnalyzer(nextConfig);
