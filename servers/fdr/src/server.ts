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

// ========= Init Sentry =========
Sentry.init({
    dsn: "https://ca7d28b81fee41961a6f9f3fb59dfa8a@o4507138224160768.ingest.us.sentry.io/4507148234522624",
    integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
        // enable Express.js middleware tracing
        new Sentry.Integrations.Express({ app: expressApp }),
        nodeProfilingIntegration(),
    ],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: 1.0,
    environment: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",
    maxValueLength: 1000,
    enabled: process.env.NODE_ENV === "production", // Do not enable sentry when running local
});

// The request handler must be the first middleware on the app
expressApp.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
expressApp.use(Sentry.Handlers.tracingHandler());
// ========= Init Sentry =========

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
    // The error handler must be registered before any other error middleware and after all controllers
    expressApp.use(Sentry.Handlers.errorHandler());
    expressApp.listen(PORT);
} catch (err) {
    app.logger.error("Failed to start express server", err);
}
