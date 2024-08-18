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

export const sentryEnv = process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev";

/**
 * In production, this integration is a no-op.
 *
 * In non-prod environments, this integration will redirect Sentry events & messages to `console`
 * and prevent them from being sent to our Sentry instance.
 *
 * The goal is to make it seamless for error detection and debugging code to go from
 * development to production.
 * @returns Sentry event if in production, `null` otherwise
 */
export function interceptAndLogSentryInDev(): Integration {
    return {
        name: "intercept-and-log-in-dev",
        processEvent(event) {
            if (event.environment === "production" || process.env.NODE_ENV === "production") {
                return event;
            }

            if (event.message) {
                // eslint-disable-next-line no-console
                console.log(event.message);
            }

            if (event.exception) {
                // eslint-disable-next-line no-console
                console.error(event.exception);
            }

            return null;
        },
    };
}
