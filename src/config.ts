const VENUS_URL_ENV_VAR = "VENUS_URL";

export interface FdrConfig {
    venusUrl: string;
}

export function getConfig(): FdrConfig {
    return {
        venusUrl: getEnvironmentVariableOrThrow(VENUS_URL_ENV_VAR),
    };
}

function getEnvironmentVariableOrThrow(environmentVariable: string): string {
    const value = process.env[environmentVariable];
    if (value == null) {
        throw new Error(`Environment variable ${environmentVariable} not found`);
    }
    return value;
}
