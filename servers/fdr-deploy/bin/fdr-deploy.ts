#!/usr/bin/env node
import { Environments, EnvironmentType } from "@fern-fern/fern-cloud-sdk/api/";
import * as cdk from "aws-cdk-lib";
import axios from "axios";
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
                        redisClusteringModeEnabled: false,
                        memory: 1024,
                        cpu: 512,
                        cacheName: "FernDocsCache",
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
                        desiredTaskCount: 6,
                        maxTaskCount: 16,
                        redis: true,
                        memory: 2048,
                        redisClusteringModeEnabled: false,
                        cpu: 1024,
                        cacheName: "FernDocsCacheTwo",
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
    const response = await axios(
        "https://raw.githubusercontent.com/fern-api/fern-cloud/main/env-scoped-resources/environments.json",
        {
            method: "GET",
            headers: {
                Authorization: "Bearer " + process.env["GITHUB_TOKEN"],
            },
        },
    );
    return response.data as Environments;
}
