/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-api/ui"],
    productionBrowserSourceMaps: true,
    output: "export",
};

module.exports = nextConfig;
