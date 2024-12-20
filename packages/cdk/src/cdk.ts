#!/usr/bin/env node
import {
  Environments,
  EnvironmentType,
} from "@fern-fern/fern-cloud-sdk/api/index";
import * as cdk from "aws-cdk-lib";
import { DocsFeStack } from "./docs-fe-stack";

void main();

async function main() {
  const environments = await getEnvironments();
  const app = new cdk.App();
  for (const [environmentType, environmentInfo] of Object.entries(
    environments
  )) {
    if (environmentInfo == null) {
      throw new Error(`No info for environment ${environmentType}`);
    }
    switch (environmentType) {
      case EnvironmentType.Dev2:
      case EnvironmentType.Prod:
        new DocsFeStack(
          app,
          `local-preview-bundle2-${environmentType.toLowerCase()}`,
          environmentType,
          {
            env: { account: "985111089818", region: "us-east-1" },
          }
        );
        break;
      default:
        continue;
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
    }
  );
  return (await response.json()) as any as Environments;
}
