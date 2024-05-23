// This is a placeholder for envvars that are unset, since serverless doesn't support passing undefined
export const OMIT = "OMIT";

export interface Env {
    GITHUB_APP_LOGIN_NAME: string;
    GITHUB_APP_LOGIN_ID: string;
    GITHUB_APP_ID: string;
    GITHUB_APP_PRIVATE_KEY: string;
    GITHUB_APP_CLIENT_ID: string;
    GITHUB_APP_CLIENT_SECRET: string;
    GITHUB_APP_WEBHOOK_SECRET: string;
    REPO_TO_RUN_ON?: string;
}

export function evaluateEnv(): Env {
    const repoToRunOn = process?.env.REPO_TO_RUN_ON;
    return {
        GITHUB_APP_LOGIN_NAME: process?.env.GITHUB_APP_LOGIN_NAME,
        GITHUB_APP_LOGIN_ID: process?.env.GITHUB_APP_LOGIN_ID,
        GITHUB_APP_ID: process?.env.GITHUB_APP_ID,
        GITHUB_APP_PRIVATE_KEY: process?.env.GITHUB_APP_PRIVATE_KEY?.replaceAll("\\n", "\n"),
        GITHUB_APP_CLIENT_ID: process?.env.GITHUB_APP_CLIENT_ID,
        GITHUB_APP_CLIENT_SECRET: process?.env.GITHUB_APP_CLIENT_SECRET,
        GITHUB_APP_WEBHOOK_SECRET: process?.env.GITHUB_APP_WEBHOOK_SECRET,
        REPO_TO_RUN_ON: repoToRunOn == null || repoToRunOn == OMIT ? undefined : process?.env.REPO_TO_RUN_ON,
    };
}
