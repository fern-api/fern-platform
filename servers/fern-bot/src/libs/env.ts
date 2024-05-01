export interface Env {
    GITHUB_APP_ID: string;
    GITHUB_APP_PRIVATE_KEY: string;
    GITHUB_APP_CLIENT_ID: string;
    GITHUB_APP_CLIENT_SECRET: string;
    GITHUB_APP_WEBHOOK_SECRET: string;
}

export function evaluateEnv(): Env {
    return {
        GITHUB_APP_ID: process?.env.GITHUB_APP_ID,
        GITHUB_APP_PRIVATE_KEY: process?.env.GITHUB_APP_PRIVATE_KEY,
        GITHUB_APP_CLIENT_ID: process?.env.GITHUB_APP_CLIENT_ID,
        GITHUB_APP_CLIENT_SECRET: process?.env.GITHUB_APP_CLIENT_SECRET,
        GITHUB_APP_WEBHOOK_SECRET: process?.env.GITHUB_APP_WEBHOOK_SECRET,
    };
}
