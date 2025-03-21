"use server";

import { getCurrentOrg } from "./auth0";
import { getFdrDao } from "./prisma";

export async function getMyDocsSites() {
  const currentOrg = await getCurrentOrg();
  return getFdrDao().docsV2().listDocsSitesForOrg(currentOrg.name);
}
