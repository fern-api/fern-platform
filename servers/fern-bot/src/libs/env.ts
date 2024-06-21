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
    REPO_DATA_S3_BUCKET?: string;
    REPO_DATA_S3_KEY?: string;
}

export function evaluateEnv(): Env {
    const repoToRunOn = process?.env.REPO_TO_RUN_ON;
    const repoDataS3Bucket = process?.env.REPO_DATA_S3_BUCKET;
    const repoDataS3Key = process?.env.REPO_DATA_S3_KEY;
    return {
        GITHUB_APP_LOGIN_NAME: process?.env.GITHUB_APP_LOGIN_NAME,
        GITHUB_APP_LOGIN_ID: process?.env.GITHUB_APP_LOGIN_ID,
        GITHUB_APP_ID: process?.env.GITHUB_APP_ID,
        GITHUB_APP_PRIVATE_KEY: process?.env.GITHUB_APP_PRIVATE_KEY?.replaceAll("\\n", "\n"),
        GITHUB_APP_CLIENT_ID: process?.env.GITHUB_APP_CLIENT_ID,
        GITHUB_APP_CLIENT_SECRET: process?.env.GITHUB_APP_CLIENT_SECRET,
        GITHUB_APP_WEBHOOK_SECRET: process?.env.GITHUB_APP_WEBHOOK_SECRET,
        REPO_TO_RUN_ON: repoToRunOn == null || repoToRunOn == OMIT ? undefined : repoToRunOn,
        REPO_DATA_S3_BUCKET: repoDataS3Bucket == null || repoDataS3Bucket == OMIT ? undefined : repoDataS3Bucket,
        REPO_DATA_S3_KEY: repoDataS3Key == null || repoDataS3Key == OMIT ? undefined : repoDataS3Key,
    };
}
