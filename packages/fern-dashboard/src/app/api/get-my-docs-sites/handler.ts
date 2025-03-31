import { FdrAPI } from "@fern-api/fdr-sdk";

import { getAuth0ManagementClient } from "@/app/services/auth0/getAuth0ManagementClient";
import { Auth0OrgID } from "@/app/services/auth0/types";
import { getFdrClient } from "@/app/services/fdr/getFdrClient";

export default async function getMyDocsSites({
  orgId,
  token,
}: {
  orgId: Auth0OrgID;
  token: string;
}) {
  const org = await getAuth0ManagementClient().organizations.get({
    id: orgId,
  });

  const fdr = getFdrClient({ token });
  const docsSites = await fdr.dashboard.getDocsSitesForOrg({
    // fdr uses org name (not id) as the org identifier
    orgId: FdrAPI.OrgId(org.data.name),
  });
  if (!docsSites.ok) {
    console.error("Failed to load docs sites", docsSites.error);
    throw new Error("Failed to load docs sites");
  }

  return docsSites.body;
}
