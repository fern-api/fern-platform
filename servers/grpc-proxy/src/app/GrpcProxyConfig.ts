const LOG_LEVEL_ENV_VAR = "LOG_LEVEL";

export interface GrpcProxyConfig {
    logLevel: string;
}

export function getConfig(): GrpcProxyConfig {
    return {
        logLevel: process.env[LOG_LEVEL_ENV_VAR] ?? "info",
    };
}
