import compression from "compression";
import cors from "cors";
import express from "express";
import { register } from "./api";
import { FdrApplication, getConfig } from "./app";
import { registerBackgroundTasks } from "./background";
import { getReadApiService } from "./controllers/api/getApiReadService";
import { getRegisterApiService } from "./controllers/api/getRegisterApiService";
import { getDocsReadService } from "./controllers/docs/v1/getDocsReadService";
import { getDocsWriteService } from "./controllers/docs/v1/getDocsWriteService";
import { getDocsReadV2Service } from "./controllers/docs/v2/getDocsReadV2Service";
import { getDocsWriteV2Service } from "./controllers/docs/v2/getDocsWriteV2Service";
import { getSnippetsFactoryService } from "./controllers/snippets/getSnippetsFactoryService";
import { getSnippetsService } from "./controllers/snippets/getSnippetsService";
import { getTemplatesService } from "./controllers/snippets/getTemplatesService";

const PORT = 8080;

const config = getConfig();

const expressApp = express();
expressApp.use(cors());
expressApp.use(compression());
expressApp.get("/health", (_req, res) => {
    res.sendStatus(200);
});
const app = new FdrApplication(config);

try {
    expressApp.use(express.json({ limit: "50mb" }));
    register(expressApp, {
        docs: {
            v1: {
                read: {
                    _root: getDocsReadService(app),
                },
                write: {
                    _root: getDocsWriteService(app),
                },
            },
            v2: {
                read: {
                    _root: getDocsReadV2Service(app),
                },
                write: {
                    _root: getDocsWriteV2Service(app),
                },
            },
        },
        api: {
            v1: {
                read: {
                    _root: getReadApiService(app),
                },
                register: {
                    _root: getRegisterApiService(app),
                },
            },
        },
        snippets: getSnippetsService(app),
        snippetsFactory: getSnippetsFactoryService(app),
        templates: getTemplatesService(app),
    });
    registerBackgroundTasks(app);
    app.logger.info(`Listening for requests on port ${PORT}`);
    expressApp.listen(PORT);
} catch (err) {
    app.logger.error("Failed to start express server", err);
}
