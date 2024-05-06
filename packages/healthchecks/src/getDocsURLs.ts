import { VercelClient } from "@fern-fern/vercel";

const VERCEL = new VercelClient({
    token: process.env.VERCEL_TOKEN ?? "",
});

const CUSTOM_SUBPATHS = [
    "https://www.assemblyai.com/docs/api-reference/overview",
    "https://primer.io/docs/api",
    "https://docs.astronomer.io/api",
    "https://buildwithfern.com/learn",
];

const DOMAINS_TO_SKIP = ["app.buildwithfern.com", "api-docs.codecombat.com", "app-staging.buildwithfern.com"];

/**
 * Returns all the live fern docs urls
 */
export async function getAllFernDocsWebsites(): Promise<string[]> {
    const listDomainsResponse = await VERCEL.v9.domains.list("fern-prod", {
        limit: 100,
        teamId: "team_6FKOM5nw037hv8g2mTk3gaH7",
        withGitRepoInfo: false,
    });
    const verifiedDomains = listDomainsResponse.domains
        .filter((customDomain) => customDomain.verified)
        .map((customDomain) => customDomain.name)
        .filter((domain) => !DOMAINS_TO_SKIP.includes(domain));
    return [...CUSTOM_SUBPATHS, ...verifiedDomains];
}
