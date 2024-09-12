// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryEnv = process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev";
const assetPrefix =
    process.env.NEXT_PUBLIC_CDN_URI != null ? new URL("/", process.env.NEXT_PUBLIC_CDN_URI).href : undefined;
const tunnelPath = "/api/fern-docs/monitoring";

Sentry.init({
    dsn: "https://216ad381a8f652e036b1833af58627e5@o4507138224160768.ingest.us.sentry.io/4507148139495424",
    // Do not enable sentry locally
    enabled: process.env.NODE_ENV === "production",
    environment: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",

    // This forces the browser to send all events to app.buildwithfern.com/api/fern-docs/monitoring
    tunnel: assetPrefix == null ? tunnelPath : new URL(tunnelPath, assetPrefix).href,

    // Performance Monitoring
    tracesSampleRate: sentryEnv === "dev" ? 0.1 : 0.25, //  Capture 25% of the transactions
    profilesSampleRate: sentryEnv === "dev" ? 0.1 : 0.25,

    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: false,

    // Capture all error replays, but only half all others
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: sentryEnv === "dev" ? 0 : 0.5,

    autoSessionTracking: true,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    integrations: [
        Sentry.replayIntegration({
            // Additional Replay configuration goes in here, for example:
            maskAllText: false,
            maskAllInputs: false,
            blockAllMedia: false,
        }),
    ],
    // This option is required for capturing headers and cookies.
    sendDefaultPii: true,

    beforeSend: (event: Sentry.Event, _: Sentry.EventHint): Sentry.Event | null => {
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

    spotlight: process.env.NODE_ENV === "development",
});
