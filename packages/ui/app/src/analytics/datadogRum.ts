import { datadogLogs } from "@datadog/browser-logs";
import { datadogRum } from "@datadog/browser-rum";

interface FernUIErrorContext {
    context: string;
    errorSource: string;
    errorDescription: string;
    data?: Record<string, unknown>;
}

export function emitDatadogError(e: unknown, context: FernUIErrorContext): void {
    datadogRum.addError(e, context);
}

export function emitDatadogErrorLog(message: string): void {
    datadogLogs.logger.error(message);
}
