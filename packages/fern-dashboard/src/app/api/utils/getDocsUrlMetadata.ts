import { FdrAPI } from "@fern-api/fdr-sdk";

import { Auth0OrgName } from "@/app/services/auth0/types";
import { getFdrClient } from "@/app/services/fdr/getFdrClient";

export async function getDocsUrlMetadata({
  url,
  token,
}: {
  url: string;
  token: string;
}) {
  return await getFdrClient({
    token,
  }).docs.v2.read.getDocsUrlMetadata({
    url: FdrAPI.Url(url),
  });
}

export async function getDocsUrlOwner({
  url,
  token,
}: {
  url: string;
  token: string;
}): Promise<{ orgName: Auth0OrgName }> {
  const metadata = await getDocsUrlMetadata({ url, token });

  if (!metadata.ok) {
    console.error(
      "Failed to load docs URL metadata",
      JSON.stringify(metadata.error)
    );
    throw new Error("Failed to load docs URL metadata");
  }

  return {
    orgName: Auth0OrgName(metadata.body.org),
  };
}
