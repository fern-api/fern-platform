import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { Auth0OrgID, Auth0OrgName } from "@/app/services/auth0/types";
import { getVenusClient } from "@/app/services/venus/getVenusClient";

import { getDocsUrlOwner } from "../utils/getDocsUrlMetadata";

export default async function getDocsUrlOwnerHandler({
  url,
  token,
}: {
  url: string;
  token: string;
}): Promise<{ orgId: Auth0OrgID | undefined }> {
  let owningOrgName: Auth0OrgName;
  try {
    const owner = await getDocsUrlOwner({ url, token });
    owningOrgName = owner.orgName;
  } catch (e) {
    // the URL is user-supplied (from the URL) so it's ok if the URL
    // doesn't exist
    console.debug("Failed to get owner for docs URL", e);
    return { orgId: undefined };
  }

  const ownerOrgData = await getVenusClient({ token }).organization.get(
    FernVenusApi.OrganizationId(owningOrgName)
  );

  if (!ownerOrgData.ok) {
    console.error(
      "Failed to load org from venus",
      JSON.stringify(ownerOrgData.error)
    );
    throw new Error("Failed to load org from venus");
  }

  return { orgId: Auth0OrgID(ownerOrgData.body.auth0Id) };
}
