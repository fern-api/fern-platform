import * as Sentry from "@sentry/nextjs";
import type { Integration } from "@sentry/types";

interface FernUIErrorContext {
    context: string;
    errorSource: string;
    errorDescription: string;
    data?: Record<string, unknown>;
}

export function captureSentryError(e: unknown, context: FernUIErrorContext): void {
    Sentry.captureException(e, {
        captureContext: {
            extra: { context: context.context, source: context.errorSource, description: context.errorDescription },
        },
        data: context.data,
    });
}

export function captureSentryErrorMessage(message: string): void {
    Sentry.captureMessage(message);
}

export function interceptAndLogSentryInDev(): Integration {
    return {
        name: "intercept-and-log-in-dev",
    };
}
