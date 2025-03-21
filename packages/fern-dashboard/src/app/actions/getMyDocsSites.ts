"use server";

import { getCurrentOrgId } from "./auth0";

export async function getMyDocsSites() {
  const orgId = await getCurrentOrgId();
}
