#!/usr/bin/env node
import { EnvironmentInfo, EnvironmentType } from "@fern-fern/fern-cloud-client/model/environments";
import * as cdk from "aws-cdk-lib";
import axios from "axios";
import { FdrDeployStack } from "../lib/fdr-deploy-stack";

void main();

async function main() {
    const version = process.env["VERSION"];
    if (version === undefined) {
        throw new Error("Version is not specified!");
    }
    const environments = await getEnvironments();
    const app = new cdk.App();
    for (const environmentType of Object.keys(environments)) {
        switch (environmentType) {
            case EnvironmentType.Dev:
            case EnvironmentType.Prod:
                new FdrDeployStack(
                    app,
                    `fdr-${environmentType.toLowerCase()}`,
                    version,
                    environmentType,
                    environments[environmentType],
                    {
                        env: { account: "985111089818", region: "us-east-1" },
                    }
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
        }
    );
    return response.data as Environments;
}
