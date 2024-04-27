// Necessary if using App Router to ensure this file runs on the client
"use client";

import { datadogLogs } from "@datadog/browser-logs";
// import { datadogRum } from "@datadog/browser-rum";

const clientToken = process?.env.NEXT_PUBLIC_DATADOG_CLIENT_TOKEN?.trim();
// https://docs.datadoghq.com/logs/log_collection/javascript/#configuration
if (clientToken && process.env.NODE_ENV === "production") {
    datadogLogs.init({
        clientToken,
        forwardErrorsToLogs: true,
        forwardConsoleLogs: ["warn", "error"],
        sessionSampleRate: 100,
        env: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",
    });

    // datadogRum.init({
    //     applicationId: process.env.NEXT_PUBLIC_DATADOG_APPLICATION_ID ?? "unset",
    //     clientToken,
    //     site: "datadoghq.com",
    //     service: "docs-frontend",
    //     env: process?.env.NEXT_PUBLIC_APPLICATION_ENVIRONMENT ?? "dev",
    //     version: process.env.VERSION,
    //     sessionSampleRate: 100,
    //     sessionReplaySampleRate: 100,
    //     trackUserInteractions: true,
    //     trackResources: true,
    //     trackLongTasks: true,
    //     defaultPrivacyLevel: "mask-user-input",
    // });
}

export default function DatadogInit(): null {
    // Render nothing - this component is only included so that the init code
    // above will run client-side
    return null;
}
