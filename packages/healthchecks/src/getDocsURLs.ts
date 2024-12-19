import { VercelClient } from "@fern-fern/vercel";
import { Domain } from "@fern-fern/vercel/api/resources/v9";

function getVercelToken() {
  if (!process.env.VERCEL_TOKEN) {
    throw new Error("VERCEL_TOKEN is required");
  }
  return process.env.VERCEL_TOKEN;
}

function getVercelProjectId() {
  if (!process.env.VERCEL_PROJECT_ID) {
    throw new Error("VERCEL_PROJECT_ID is required");
  }
  return process.env.VERCEL_PROJECT_ID;
}

function getVercelTeamId() {
  if (!process.env.VERCEL_ORG_ID) {
    throw new Error("VERCEL_ORG_ID is required");
  }
  return process.env.VERCEL_ORG_ID;
}

const VERCEL = new VercelClient({ token: getVercelToken() });

const CUSTOM_SUBPATHS = [
  // Commented out because was giving errors
  // "https://www.assemblyai.com/docs/api-reference/overview",
  "https://primer.io/docs/api",
  "https://docs.astronomer.io/api",
  "https://buildwithfern.com/learn",
];

const DOMAINS_TO_SKIP = [
  "app.buildwithfern.com",
  "api-docs.codecombat.com",
  "app-staging.buildwithfern.com",
];

/**
 * Returns all the live fern docs urls
 */
export async function getAllFernDocsWebsites(): Promise<string[]> {
  const listDomainsResponse = await VERCEL.v9.domains.list(
    getVercelProjectId(),
    {
      limit: 100,
      teamId: getVercelTeamId(),
      withGitRepoInfo: false,
    }
  );
  const domainsConfigured = await Promise.all(
    listDomainsResponse.domains.map(async (customDomain) => ({
      value: customDomain,
      isConfigured: await isDomainConfigured(customDomain),
    }))
  );
  const verifiedDomains = domainsConfigured
    .filter(
      (customDomain) => customDomain.value.verified && customDomain.isConfigured
    )
    .map((customDomain) => customDomain.value.name)
    .filter((domain) => !DOMAINS_TO_SKIP.includes(domain));
  return [...CUSTOM_SUBPATHS, ...verifiedDomains];
}

async function isDomainConfigured(customDomain: Domain) {
  const getConfigResponse = await VERCEL.v9.domains.getConfig(
    customDomain.name,
    {
      teamId: getVercelTeamId(),
    }
  );
  return !getConfigResponse.misconfigured;
}
