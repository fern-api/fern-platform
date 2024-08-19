import * as Sentry from "@sentry/nextjs";

interface FernUIErrorContext {
    context: string;
    errorSource: string;
    errorDescription: string;
    data?: Record<string, unknown>;
}

function toSentryContext(context: FernUIErrorContext) {
    return {
        captureContext: {
            extra: { context: context.context, source: context.errorSource, description: context.errorDescription },
        },
        data: context.data,
    };
}

export function captureSentryError(e: unknown, context: FernUIErrorContext): void {
    Sentry.captureException(e, toSentryContext(context));
}

export function captureSentryErrorMessage(message: string): void {
    Sentry.captureMessage(message);
}

/**
 * Convenience function to wrap an action in a try/catch, so exceptions go to sentry.
 *
 * @param action
 * @param context
 * @returns
 */
export function safeCall(action: () => void, context?: FernUIErrorContext): void {
    try {
        return action();
    } catch (e) {
        Sentry.captureException(e, context ? toSentryContext(context) : undefined);
    }
}
