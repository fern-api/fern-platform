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
 * In production and non-dev environments, this integration is a no-op.
 *
 * In dev environments, this integration will redirect Sentry events & messages to `console`
 * and prevent them from being sent to our Sentry instance.
 *
 * The goal is to make it seamless for error detection and debugging code to go from
 * development to production.
 * @returns Sentry event if in production, `null` otherwise
 */
export function interceptAndLogSentryInDev(): Integration {
    return {
        name: "intercept-and-log-in-dev",

        // `setupOnce` is a no-op; it's supposed to be used for e.g. global monkey patching and similar things.
        // That's irrelevant here.
        //
        // It's optional in Sentry v8, but we're still on v7, where this is a required field.
        //
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        setupOnce() {},

        processEvent(event) {
            if (sentryEnv !== "dev") {
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
