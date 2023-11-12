/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-ui/ui"],
    productionBrowserSourceMaps: true,
    experimental: {
        scrollRestoration: true,
    },
    rewrites: async () => [
        {
            has: [
                {
                    type: "header",
                    key: "x-fern-host",
                    value: "(?<host>.*)",
                },
            ],
            source: "/:path*",
            destination: "/:host/:path*",
        },
        {
            has: [
                {
                    type: "host",
                    value: "(?<host>.*)",
                },
            ],
            source: "/:path*",
            destination: "/:host/:path*",
        },
    ],
};

module.exports = nextConfig;
