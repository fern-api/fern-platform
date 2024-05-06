import type { AWS } from "@serverless/typescript";

import updateOpenApiSpec from "@functions/oas-cron";

const serverlessConfiguration: AWS = {
    service: "fern-bot",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild"],
    provider: {
        name: "aws",
        runtime: "nodejs18.x",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
            GITHUB_APP_ID: process?.env.GITHUB_APP_ID ?? "placeholder",
            GITHUB_APP_PRIVATE_KEY: process?.env.GITHUB_APP_PRIVATE_KEY ?? "placeholder",
            GITHUB_APP_CLIENT_ID: process?.env.GITHUB_APP_CLIENT_ID ?? "placeholder",
            GITHUB_APP_CLIENT_SECRET: process?.env.GITHUB_APP_CLIENT_SECRET ?? "placeholder",
            GITHUB_APP_WEBHOOK_SECRET: process?.env.GITHUB_APP_WEBHOOK_SECRET ?? "placeholder",
            CO_API_KEY: process?.env.CO_API_KEY ?? "placeholder",
        },
    },
    functions: { updateOpenApiSpec },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ["aws-sdk"],
            target: "node18",
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10,
        },
    },
};

module.exports = serverlessConfiguration;
