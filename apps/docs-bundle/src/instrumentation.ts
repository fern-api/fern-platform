import * as Sentry from "@sentry/nextjs";

export async function register(): Promise<void> {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init({
            dsn: "https://216ad381a8f652e036b1833af58627e5@o4507138224160768.ingest.us.sentry.io/4507148139495424",

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: 0.25,

            // ...

            // Note: if you want to override the automatic release value, do not set a
            // `release` value here - use the environment variable `SENTRY_RELEASE`, so
            // that it will also get attached to your source maps
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init({
            dsn: "https://216ad381a8f652e036b1833af58627e5@o4507138224160768.ingest.us.sentry.io/4507148139495424",

            // Set tracesSampleRate to 1.0 to capture 100%
            // of transactions for performance monitoring.
            // We recommend adjusting this value in production
            tracesSampleRate: 0.25,

            // ...

            // Note: if you want to override the automatic release value, do not set a
            // `release` value here - use the environment variable `SENTRY_RELEASE`, so
            // that it will also get attached to your source maps
        });
    }
}
