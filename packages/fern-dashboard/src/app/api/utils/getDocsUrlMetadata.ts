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
  const metadata = await getFdrClient({
    token,
  }).docs.v2.read.getDocsUrlMetadata({
    url: FdrAPI.Url(url),
  });

  if (!metadata.ok) {
    console.error(
      "Failed to load docs URL metadata",
      JSON.stringify(metadata.error)
    );
    throw new Error("Failed to load docs URL metadata");
  }

  return metadata.body;
}

export async function getDocsUrlOwner({
  url,
  token,
}: {
  url: string;
  token: string;
}): Promise<{ orgName: Auth0OrgName }> {
  const metadata = await getDocsUrlMetadata({ url, token });
  return {
    orgName: Auth0OrgName(metadata.org),
  };
}
