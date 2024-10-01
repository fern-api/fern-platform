import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import compression from "compression";
import cors from "cors";
import express from "express";
import { register } from "./api";
import { FdrApplication, getConfig } from "./app";
import { registerBackgroundTasks } from "./background";
import { getReadApiService } from "./controllers/api/getApiReadService";
import { getRegisterApiService } from "./controllers/api/getRegisterApiService";
import { getApiDiffService } from "./controllers/diff/getApiDiffService";
import { getDocsCacheService } from "./controllers/docs-cache/getDocsCacheService";
import { getDocsReadService } from "./controllers/docs/v1/getDocsReadService";
import { getDocsWriteService } from "./controllers/docs/v1/getDocsWriteService";
import { getDocsReadV2Service } from "./controllers/docs/v2/getDocsReadV2Service";
import { getDocsWriteV2Service } from "./controllers/docs/v2/getDocsWriteV2Service";
import { getGeneratorsCliController } from "./controllers/generators/getGeneratorsCliController";
import { getGeneratorsRootController } from "./controllers/generators/getGeneratorsRootController";
import { getGeneratorsVersionsController } from "./controllers/generators/getGeneratorsVersionsController";
import { getGitController } from "./controllers/git/getGitController";
import { getVersionsService } from "./controllers/sdk/getVersionsService";
import { getSnippetsFactoryService } from "./controllers/snippets/getSnippetsFactoryService";
import { getSnippetsService } from "./controllers/snippets/getSnippetsService";
import { getTemplatesService } from "./controllers/snippets/getTemplatesService";
import { getTokensService } from "./controllers/tokens/getTokensService";
import { checkRedis } from "./healthchecks/checkRedis";

const PORT = 8080;
const expressApp = express();
const app = new GrpcProxy();

void startServer();

async function startServer(): Promise<void> {
    try {
        await app.initialize();
        expressApp.use(express.json({ limit: "50mb" }));
        register(expressApp, {
            // docs: {
            //     v1: {
            //         read: {
            //             _root: getDocsReadService(app),
            //         },
            //         write: {
            //             _root: getDocsWriteService(app),
            //         },
            //     },
            //     v2: {
            //         read: {
            //             _root: getDocsReadV2Service(app),
            //         },
            //         write: {
            //             _root: getDocsWriteV2Service(app),
            //         },
            //     },
            // },
            // api: {
            //     v1: {
            //         read: {
            //             _root: getReadApiService(app),
            //         },
            //         register: {
            //             _root: getRegisterApiService(app),
            //         },
            //     },
            // },
        });
        app.logger.info(`Listening for requests on port ${PORT}`);
        expressApp.listen(PORT);
    } catch (err) {
        app.logger.error("Failed to start express server", err);
    }
}
