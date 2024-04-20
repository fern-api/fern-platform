import { H, Handlers } from "@highlight-run/node";
import type { Attributes } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
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
import { getTemplateService } from "./controllers/snippets/getTemplateService";
import { HIGHLIGHT_PROJECT_ID, HIGHLIGHT_SERVICE_NAME } from "./app/FdrApplication";

const config = getConfig();

// [Tracing] OTel config for Highlight
const attributes: Attributes = {
    "highlight.project_id": HIGHLIGHT_PROJECT_ID,
};
const sdk = new NodeSDK({
    resource: new Resource(attributes),
    traceExporter: new OTLPTraceExporter({
        url: "https://otel.highlight.io:4318/v1/traces",
    }),
});
sdk.start();

// [Logging + Error Monitoring] Highlight-proper config
const highlightConfig = {
    projectID: HIGHLIGHT_PROJECT_ID,
    serviceName: HIGHLIGHT_SERVICE_NAME,
    // TODO(armando): it would be great to send version over as well
    // There's got to be a better way to do this
    environment: config.venusUrl.includes("dev") ? "dev" : "production",
};
H.init(highlightConfig);

// Application start up
const PORT = 8080;

const expressApp = express();
expressApp.use(cors());
expressApp.use(compression());
expressApp.get("/health", (_req, res) => {
    res.sendStatus(200);
});
const app = new FdrApplication(config);

try {
    expressApp.use(Handlers.middleware(highlightConfig));
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
        _root: getSnippetsService(app),
        snippetsFactory: getSnippetsFactoryService(app),
        template: getTemplateService(app),
    });
    registerBackgroundTasks(app);
    app.logger.info(`Listening for requests on port ${PORT}`);
    expressApp.use(Handlers.errorHandler(highlightConfig));
    expressApp.listen(PORT);
} catch (err) {
    app.logger.error("Failed to start express server", err);
}
