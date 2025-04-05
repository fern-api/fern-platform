import { FernVenusApi } from "@fern-api/venus-api-sdk";

import { Auth0OrgID } from "@/app/services/auth0/types";
import { getVenusClient } from "@/app/services/venus/getVenusClient";

import { getDocsUrlMetadata } from "../utils/getDocsUrlMetadata";

export default async function getDocsUrlOwnerHandler({
  url,
  token,
}: {
  url: string;
  token: string;
}): Promise<{ orgId: Auth0OrgID | undefined }> {
  const docsUrlMetadata = await getDocsUrlMetadata({ url, token });
  if (!docsUrlMetadata.ok) {
    // the docs url is user-supplied (parsed from the page url) so it's ok if it
    // doesn't exist
    if (docsUrlMetadata.error.error === "DomainNotRegisteredError") {
      return { orgId: undefined };
    }

    console.error(
      "Failed to load docs URL metadata",
      JSON.stringify(docsUrlMetadata.error)
    );
    throw new Error("Failed to load docs URL metadata");
  }

  const owningOrg = await getVenusClient({ token }).organization.get(
    FernVenusApi.OrganizationId(docsUrlMetadata.body.org)
  );

  if (!owningOrg.ok) {
    console.error(
      "Failed to load org from venus",
      JSON.stringify(owningOrg.error)
    );
    throw new Error("Failed to load org from venus");
  }

  return { orgId: Auth0OrgID(owningOrg.body.auth0Id) };
}
