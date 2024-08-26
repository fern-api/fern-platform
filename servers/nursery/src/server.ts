import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import compression from "compression";
import cors from "cors";
import express from "express";
import { NurseryApplication } from "./NurseryApplication";
import { register } from "./api";
import { getOwnersService } from "./controllers/getOwnersService";
import { getTokensService } from "./controllers/getTokensService";

const PORT = 8080;

const app = new NurseryApplication();

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
    tracesSampleRate: app.config.environment == "prod" ? 0.75 : 0.5, //  Capture 75% of the transactions
    // Set sampling rate for profiling - this is relative to tracesSampleRate
    profilesSampleRate: app.config.environment == "prod" ? 0.75 : 0.5,
    environment: app.config.environment,
    maxValueLength: 1000,
    enabled: app.config.environment === "dev" || app.config.environment == "prod",
});

// The request handler must be the first middleware on the app
expressApp.use(Sentry.Handlers.requestHandler());
// TracingHandler creates a trace for every incoming request
expressApp.use(Sentry.Handlers.tracingHandler());
// ========= Init Sentry =========

expressApp.use(cors());
expressApp.use(compression());

expressApp.get("/health", async (_req, res) => {
    res.sendStatus(200);
});

void startServer();

async function startServer(): Promise<void> {
    try {
        expressApp.use(express.json({ limit: "50mb" }));
        register(expressApp, {
            owner: getOwnersService(),
            token: getTokensService(),
        });

        expressApp.use(Sentry.Handlers.errorHandler());
        expressApp.listen(PORT);
    } catch (err) {
        app.logger.error("Failed to start express server", err);
    }
}
