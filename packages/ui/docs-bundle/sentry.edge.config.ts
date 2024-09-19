// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryEnv = process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev";

Sentry.init({
    // Do not enable sentry locally
    enabled: process.env.NODE_ENV === "production",
    dsn: "https://216ad381a8f652e036b1833af58627e5@o4507138224160768.ingest.us.sentry.io/4507148139495424",

    // Performance Monitoring
    tracesSampleRate: sentryEnv === "dev" ? 0.1 : 0.25, //  Capture 25% of the transactions
    profilesSampleRate: sentryEnv === "dev" ? 0.1 : 0.25,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,
    environment: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",

    spotlight: process.env.NODE_ENV === "development",

    beforeSend: (event: Sentry.ErrorEvent, _: Sentry.EventHint): Sentry.ErrorEvent | null => {
        // Filter out events from privategpt
        if (event.request?.url?.includes("privategpt")) {
            return null;
        }
        if (
            event.tags != null &&
            event.tags["url"] != null &&
            typeof event.tags["url"] === "string" &&
            event.tags["url"].includes("privategpt")
        ) {
            return null;
        }

        return event;
    },
});
