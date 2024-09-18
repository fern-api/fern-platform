export function getVercelToken(): string {
    if (!process.env.VERCEL_TOKEN) {
        throw new Error("VERCEL_TOKEN is required");
    }
    return process.env.VERCEL_TOKEN;
}

export function getVercelProjectId(): string {
    if (!process.env.VERCEL_PROJECT_ID) {
        throw new Error("VERCEL_PROJECT_ID is required");
    }
    return process.env.VERCEL_PROJECT_ID;
}

export function getVercelTeamId(): string | undefined {
    return process.env.VERCEL_ORG_ID;
}
