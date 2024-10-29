#!/usr/bin/env node
import { Environments, EnvironmentType } from "@fern-fern/fern-cloud-sdk/api/";
import * as cdk from "aws-cdk-lib";
import { FdrDeployStack } from "../scripts/fdr-deploy-stack";

void main();

async function main() {
    const version = process.env["VERSION"];
    if (version === undefined) {
        throw new Error("Version is not specified!");
    }
    const environments = await getEnvironments();
    const app = new cdk.App();
    for (const [environmentType, environmentInfo] of Object.entries(environments)) {
        if (environmentInfo == null) {
            throw new Error(`No info for environment ${environmentType}`);
        }
        switch (environmentType) {
            case EnvironmentType.Dev:
            case EnvironmentType.Dev2:
                new FdrDeployStack(
                    app,
                    `fdr-${environmentType.toLowerCase()}`,
                    version,
                    environmentType,
                    environmentInfo,
                    {
                        desiredTaskCount: 2,
                        maxTaskCount: 4,
                        redis: true,
                        redisClusteringModeEnabled: true,
                        memory: 1024,
                        cpu: 512,
                        cacheName: "FernDocsCache3",
                        cacheNodeType: "cache.r7g.large",
                    },
                    {
                        env: { account: "985111089818", region: "us-east-1" },
                    },
                );
                break;
            case EnvironmentType.Prod:
                new FdrDeployStack(
                    app,
                    `fdr-${environmentType.toLowerCase()}`,
                    version,
                    environmentType,
                    environmentInfo,
                    {
                        desiredTaskCount: 12,
                        maxTaskCount: 24,
                        redis: true,
                        memory: 4096,
                        redisClusteringModeEnabled: true,
                        cpu: 2048,
                        cacheName: "FernDocsCache6",
                        cacheNodeType: "cache.r7g.xlarge",
                    },
                    {
                        env: { account: "985111089818", region: "us-east-1" },
                    },
                );
                break;
            default:
                return;
        }
    }
}

async function getEnvironments(): Promise<Environments> {
    const response = await fetch(
        "https://raw.githubusercontent.com/fern-api/fern-cloud/main/env-scoped-resources/environments.json",
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + process.env["GITHUB_TOKEN"],
            },
        },
    );
    return (await response.json()) as Environments;
}
