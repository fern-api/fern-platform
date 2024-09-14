import createWithBundleAnalyzer from "@next/bundle-analyzer";
import process from "node:process";

const nextConfig = {};

const withBundleAnalyzer = createWithBundleAnalyzer({
    enabled: process.env.ANALYZE === "1",
});

export default withBundleAnalyzer(nextConfig);
