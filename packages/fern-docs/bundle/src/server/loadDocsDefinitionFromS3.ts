import { DocsV2Read } from "@fern-api/fdr-sdk";

export async function loadDocsDefinitionFromS3({
  domain,
  docsDefinitionUrl,
}: {
  domain: string;
  docsDefinitionUrl: string;
}): Promise<DocsV2Read.LoadDocsForUrlResponse | undefined> {
  try {
    console.log("fetching docs definition:");
    console.log("domain:", domain);
    const cleanDomain = domain.replace(/^https?:\/\//, "");
    const dbDocsDefUrl = `${docsDefinitionUrl}/${cleanDomain}.json`;
    console.log("dbDocsDefUrl", dbDocsDefUrl);

    const response = await fetch(dbDocsDefUrl);
    if (response.ok) {
      const json = await response.json();
      console.log(json);
      return json as DocsV2Read.LoadDocsForUrlResponse;
    }
    return undefined;
  } catch (error) {
    console.error("Error loading docs definition from S3:", error);
    return undefined;
  }
}
