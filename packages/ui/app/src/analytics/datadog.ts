import { datadogLogs } from "@datadog/browser-logs";

export function initializeDatadog(): void {
    const clientToken = process.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN?.trim();
    // https://docs.datadoghq.com/logs/log_collection/javascript/#configuration
    if (clientToken && process.env.NODE_ENV === "production") {
        datadogLogs.init({
            clientToken,
            forwardErrorsToLogs: true,
            forwardConsoleLogs: ["warn", "error"],
            sessionSampleRate: 100,
        });
    }
}
