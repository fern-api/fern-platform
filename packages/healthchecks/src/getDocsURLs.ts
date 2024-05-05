import { VercelClient } from "@fern-fern/vercel";

const VERCEL = new VercelClient({
    token: process.env.VERCEL_TOKEN ?? "",
});

const CUSTOM_SUBPATHS = [
    "https://www.assemblyai.com/docs/api-reference/",
    "https://primer.io/docs/api",
    "https://astronomer.io/docs/api",
    "https://buildwithfern.com/learn",
];

/**
 * Returns all the live fern docs urls
 */
export async function getAllFernDocsWebsites(): Promise<string[]> {
    const listDomainsResponse = await VERCEL.v9.domains.list("fern-prod", {
        limit: "100",
        teamId: "team_6FKOM5nw037hv8g2mTk3gaH7",
    });
    return [...CUSTOM_SUBPATHS, ...listDomainsResponse.domains.map((customDomain) => customDomain.name)];
}
