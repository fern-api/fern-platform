"use server";

import { FdrAPI } from "@fern-api/fdr-sdk";

import { getFdrClient } from "../services/fdr";
import { AsyncCache } from "./AsyncCache";
import { getCurrentOrg, getCurrentSession } from "./auth0";
import { Auth0OrgName } from "./types";

const MY_DOCS_SITE_CACHE = new AsyncCache<
  Auth0OrgName,
  FdrAPI.dashboard.GetDocsSitesForOrgResponse
>({
  ttlInSeconds: 10,
});

export async function getMyDocsSites() {
  const currentOrg = await getCurrentOrg();
  const orgId = currentOrg.name;

  return MY_DOCS_SITE_CACHE.get(orgId, async () => {
    const { session } = await getCurrentSession();
    const fdr = getFdrClient({ token: session.tokenSet.accessToken });
    const docsSites = await fdr.dashboard.getDocsSitesForOrg({
      orgId: FdrAPI.OrgId(orgId),
    });
    if (!docsSites.ok) {
      console.error("Failed to load docs sites", docsSites.error);
      throw new Error("Failed to load docs sites");
    }
    return docsSites.body;
  });
}
