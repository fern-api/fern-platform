import { FdrClient } from "@fern-api/fdr-sdk";
import { PrismaClient } from "@prisma/client";
import execa from "execa";
import express from "express";
import http from "http";
import { register } from "../../api";
import { FdrApplication } from "../../app";
import { getReadApiService } from "../../controllers/api/getApiReadService";
import { getRegisterApiService } from "../../controllers/api/getRegisterApiService";
import { getDocsReadService } from "../../controllers/docs/v1/getDocsReadService";
import { getDocsWriteService } from "../../controllers/docs/v1/getDocsWriteService";
import { getDocsReadV2Service } from "../../controllers/docs/v2/getDocsReadV2Service";
import { getDocsWriteV2Service } from "../../controllers/docs/v2/getDocsWriteV2Service";
import { getSnippetsFactoryService } from "../../controllers/snippets/getSnippetsFactoryService";
import { getSnippetsService } from "../../controllers/snippets/getSnippetsService";
import { getTemplateService } from "../../controllers/snippets/getTemplateService";
import { createMockFdrApplication } from "../mock";

let teardown = false;

declare module "vitest" {
    export interface ProvidedContext {
        url: string;
    }
}

export async function setup({ provide }: { provide: (key: string, value: any) => void }) {
    await execa("docker-compose", ["-f", "docker-compose.test.yml", "up", "-d"], { shell: true });
    await execa("yarn", ["prisma", "migrate", "deploy"], {
        shell: true,
    });
    const instance = runMockFdr(9999);
    provide("url", `http://localhost:${instance.port}/`);
    return async () => {
        if (teardown) {
            throw new Error("teardown called twice");
        }
        teardown = true;
        await execa("docker-compose", ["-f", "docker-compose.test.yml", "down"], { shell: true });
        return new Promise<void>((resolve) => {
            instance.server?.close(() => resolve());
        });
    };
}

export const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
});

export const fdrApplication = createMockFdrApplication({
    orgIds: ["acme"],
});

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

function runMockFdr(port: number): MockFdr.Instance {
    const unauthedClient = new FdrClient({
        environment: `http://localhost:${port}/`,
    });
    const authedClient = new FdrClient({
        environment: `http://localhost:${port}/`,
        token: "dummy",
    });
    const app = express();
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
        _root: getSnippetsService(fdrApplication),
        snippetsFactory: getSnippetsFactoryService(fdrApplication),
        template: getTemplateService(fdrApplication),
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
