import Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export declare namespace InstrumentSentry {

    interface Args {
        /*The sentry dsn to forward events to (unique per project)*/
        dsn: string;
        environment: "prod" | "dev" | "local";
    }
}

export function instrumentSentry({ dsn, environment }: InstrumentSentry.Args): void {
    Sentry.init({
        dsn,
        integrations: [
            // enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app: expressApp }),
            nodeProfilingIntegration(),
        ],
        // Performance Monitoring
        tracesSampleRate: environment === "prod" ? 0.25 : 0.1, //  Capture 25% of the transactions
        profilesSampleRate: environment === "prod" ? 0.25 : 0.1,
        environment,
        maxValueLength: 1000,
        enabled: environment === "dev" || environment === "prod",
    });
}
