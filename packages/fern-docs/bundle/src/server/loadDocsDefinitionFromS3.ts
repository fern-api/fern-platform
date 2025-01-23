import { FdrAPI } from "@fern-api/fdr-sdk";

export async function loadDocsDefinitionFromS3({
  domain,
  docsDefinitionUrl,
}: {
  domain: string;
  docsDefinitionUrl: string;
}): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse | undefined> {
  try {
    console.log("fetching docs definition:");
    const cleanDomain = domain.replace(/^https?:\/\//, "");
    const dbDocsDefUrl = `${docsDefinitionUrl}/${cleanDomain}.json`;
    console.log("dbDocsDefUrl", dbDocsDefUrl);

    const response = await fetch(dbDocsDefUrl);
    if (response.ok) {
      const json = await response.json();
      return json as FdrAPI.docs.v2.read.LoadDocsForUrlResponse;
    }
    return undefined;
  } catch (error) {
    console.error("Error loading docs definition from S3:", error);
    return undefined;
  }
}
