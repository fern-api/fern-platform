import createWithBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

const withBundleAnalyzer = createWithBundleAnalyzer({
    enabled: process.env.ANALYZE === "1",
});

export default withBundleAnalyzer(nextConfig);
