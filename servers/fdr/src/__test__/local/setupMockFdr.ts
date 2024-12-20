import { FdrClient } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";
import { execa } from "execa";
import express from "express";
import http from "http";
import { register } from "../../api";
import { FdrApplication, FdrConfig } from "../../app";
import { getReadApiService } from "../../controllers/api/getApiReadService";
import { getRegisterApiService } from "../../controllers/api/getRegisterApiService";
import { getApiDiffService } from "../../controllers/diff/getApiDiffService";
import { getDocsCacheService } from "../../controllers/docs-cache/getDocsCacheService";
import { getDocsReadService } from "../../controllers/docs/v1/getDocsReadService";
import { getDocsWriteService } from "../../controllers/docs/v1/getDocsWriteService";
import { getDocsReadV2Service } from "../../controllers/docs/v2/getDocsReadV2Service";
import { getDocsWriteV2Service } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { getGeneratorsCliController } from "../../controllers/generators/getGeneratorsCliController";
import { getGeneratorsRootController } from "../../controllers/generators/getGeneratorsRootController";
import { getGeneratorsVersionsController } from "../../controllers/generators/getGeneratorsVersionsController";
import { getGitController } from "../../controllers/git/getGitController";
import { getVersionsService } from "../../controllers/sdk/getVersionsService";
import { getSnippetsFactoryService } from "../../controllers/snippets/getSnippetsFactoryService";
import { getSnippetsService } from "../../controllers/snippets/getSnippetsService";
import { getTemplatesService } from "../../controllers/snippets/getTemplatesService";
import { getTokensService } from "../../controllers/tokens/getTokensService";
import { createMockFdrApplication } from "../mock";

let teardown = false;

declare module "vitest" {
  export interface ProvidedContext {
    url: string;
  }
}

export async function setup({
  provide,
}: {
  provide: (key: string, value: any) => void;
}) {
  await execa("docker-compose", ["-f", "docker-compose.test.yml", "up", "-d"], {
    stdio: "inherit",
  });
  await sleep(3000);
  await execa("pnpm", ["prisma", "migrate", "deploy"], {
    stdio: "inherit",
  });
  const instance = await runMockFdr(9999);
  provide("url", `http://localhost:${instance.port}/`);
  return async () => {
    if (teardown) {
      throw new Error("teardown called twice");
    }
    teardown = true;
    await execa("docker-compose", ["-f", "docker-compose.test.yml", "down"], {
      stdio: "inherit",
    });
    return new Promise<void>((resolve) => {
      instance.server?.close(() => resolve());
    });
  };
}

export const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
  transactionOptions: {
    timeout: 15000,
    maxWait: 15000,
  },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

declare namespace MockFdr {
  interface Instance {
    authedClient: FdrClient;
    unauthedClient: FdrClient;
    prisma: PrismaClient;
    app: FdrApplication;
    server: http.Server | undefined;
    port: number;
  }
}

async function runMockFdr(port: number): Promise<MockFdr.Instance> {
  const unauthedClient = new FdrClient({
    environment: `http://localhost:${port}/`,
  });
  const authedClient = new FdrClient({
    environment: `http://localhost:${port}/`,
    token: "dummy",
  });
  const overrides: Partial<FdrConfig> = { redisEnabled: true };
  const fdrApplication = createMockFdrApplication({
    orgIds: ["acme", "octoai"],
    configOverrides: overrides,
  });
  const app = express();
  await fdrApplication.initialize();
  register(app, {
    docs: {
      v1: {
        read: { _root: getDocsReadService(fdrApplication) },
        write: { _root: getDocsWriteService(fdrApplication) },
      },
      v2: {
        read: { _root: getDocsReadV2Service(fdrApplication) },
        write: { _root: getDocsWriteV2Service(fdrApplication) },
      },
    },
    api: {
      v1: {
        read: { _root: getReadApiService(fdrApplication) },
        register: { _root: getRegisterApiService(fdrApplication) },
      },
    },
    snippets: getSnippetsService(fdrApplication),
    snippetsFactory: getSnippetsFactoryService(fdrApplication),
    templates: getTemplatesService(fdrApplication),
    diff: getApiDiffService(fdrApplication),
    docsCache: getDocsCacheService(fdrApplication),
    sdks: {
      versions: getVersionsService(fdrApplication),
    },
    generators: {
      _root: getGeneratorsRootController(fdrApplication),
      cli: getGeneratorsCliController(fdrApplication),
      versions: getGeneratorsVersionsController(fdrApplication),
    },
    tokens: getTokensService(fdrApplication),
    git: getGitController(fdrApplication),
  });
  const server = app.listen(port);
  console.log(`Mock FDR server running on http://localhost:${port}/`);
  return {
    authedClient,
    unauthedClient,
    prisma,
    app: fdrApplication,
    server,
    port,
  };
}
