/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-non-null-asserted-optional-chain */
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
    DEFAULT_VENUS_ORIGIN: string;
    DEFAULT_FDR_ORIGIN: string;
    CUSTOMER_ALERTS_SLACK_CHANNEL: string;
    CUSTOMER_PULLS_SLACK_CHANNEL: string;
    FERNIE_SLACK_APP_TOKEN: string;
    FERN_TOKEN: string;
    ENVIRONMENT: string;
}

export function evaluateEnv(): Env {
    const repoToRunOn = process?.env.REPO_TO_RUN_ON;
    const repoDataS3Bucket = process?.env.REPO_DATA_S3_BUCKET;
    const repoDataS3Key = process?.env.REPO_DATA_S3_KEY;

    // These assertions are technically unsafe, but we don't want the bot to deploy without them
    return {
        GITHUB_APP_LOGIN_NAME: process?.env.GITHUB_APP_LOGIN_NAME!,
        GITHUB_APP_LOGIN_ID: process?.env.GITHUB_APP_LOGIN_ID!,
        GITHUB_APP_ID: process?.env.GITHUB_APP_ID!,
        GITHUB_APP_PRIVATE_KEY: process?.env.GITHUB_APP_PRIVATE_KEY?.replaceAll("\\n", "\n")!,
        GITHUB_APP_CLIENT_ID: process?.env.GITHUB_APP_CLIENT_ID!,
        GITHUB_APP_CLIENT_SECRET: process?.env.GITHUB_APP_CLIENT_SECRET!,
        GITHUB_APP_WEBHOOK_SECRET: process?.env.GITHUB_APP_WEBHOOK_SECRET!,
        REPO_TO_RUN_ON: repoToRunOn == null || repoToRunOn === OMIT ? undefined : repoToRunOn,
        REPO_DATA_S3_BUCKET: repoDataS3Bucket == null || repoDataS3Bucket === OMIT ? undefined : repoDataS3Bucket,
        REPO_DATA_S3_KEY: repoDataS3Key == null || repoDataS3Key === OMIT ? undefined : repoDataS3Key,
        DEFAULT_VENUS_ORIGIN: process?.env.DEFAULT_VENUS_ORIGIN!,
        DEFAULT_FDR_ORIGIN: process?.env.DEFAULT_FDR_ORIGIN!,
        FERNIE_SLACK_APP_TOKEN: process?.env.FERNIE_SLACK_APP_TOKEN!,
        CUSTOMER_ALERTS_SLACK_CHANNEL: process?.env.CUSTOMER_ALERTS_SLACK_CHANNEL!,
        CUSTOMER_PULLS_SLACK_CHANNEL: process?.env.CUSTOMER_PULLS_SLACK_CHANNEL!,
        FERN_TOKEN: process?.env.FERN_TOKEN!,
        ENVIRONMENT: process?.env.ENVIRONMENT!,
    };
}
