import { Sentry } from "@sentry/node";



export function instrumentSentry(dsn: string): void {
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
        tracesSampleRate: config.applicationEnvironment == "prod" ? 0.25 : 0.1, //  Capture 25% of the transactions
        profilesSampleRate: config.applicationEnvironment == "prod" ? 0.25 : 0.1,
        environment: config.applicationEnvironment,
        maxValueLength: 1000,
        enabled: config.applicationEnvironment === "dev" || config.applicationEnvironment == "prod",
    });
}