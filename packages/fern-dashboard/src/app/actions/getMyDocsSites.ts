"use server";

import { ListDocsSitesForOrgResponse } from "@fern-platform/fdr";

import { AsyncCache } from "./AsyncCache";
import { getCurrentOrg } from "./auth0";
import { getFdrDao } from "./prisma";
import { Auth0OrgName } from "./types";

const MY_DOCS_SITE_CACHE = new AsyncCache<
  Auth0OrgName,
  ListDocsSitesForOrgResponse
>({
  ttlInSeconds: 10,
});

export async function getMyDocsSites() {
  const currentOrg = await getCurrentOrg();
  return MY_DOCS_SITE_CACHE.get(currentOrg.name, () =>
    getFdrDao().docsV2().listDocsSitesForOrg(currentOrg.name)
  );
}
