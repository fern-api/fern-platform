import * as Sentry from "@sentry/nextjs";

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
