/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@fern-api/ui"],
    productionBrowserSourceMaps: true,
    output: "export",
    // distDir: 'dist'
    // rewrites: async () => [
    //     {
    //         has: [
    //             {
    //                 type: "header",
    //                 key: "x-fern-host",
    //                 value: "(?<host>.*)",
    //             },
    //         ],
    //         source: "/:path*",
    //         destination: "/:host/:path*",
    //     },
    //     {
    //         has: [
    //             {
    //                 type: "host",
    //                 value: "(?<host>.*)",
    //             },
    //         ],
    //         source: "/:path*",
    //         destination: "/:host/:path*",
    //     },
    // ],
};

module.exports = nextConfig;
