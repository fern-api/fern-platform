"use server";

import { AsyncCache } from "./AsyncCache";
import { getCurrentOrg } from "./auth0";
import { Auth0OrgName } from "./types";

const MY_DOCS_SITE_CACHE = new AsyncCache<
  Auth0OrgName,
  ListDocsSitesForOrgResponse
>({
  ttlInSeconds: 10,
});

export async function getMyDocsSites() {
  const currentOrg = await getCurrentOrg();
}
