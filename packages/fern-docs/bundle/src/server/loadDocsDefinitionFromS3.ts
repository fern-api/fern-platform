import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { FdrAPI } from "@fern-api/fdr-sdk";

export async function loadDocsDefinitionFromS3({
  domain,
  docsDefinitionUrl,
}: {
  domain: string;
  docsDefinitionUrl: string;
}): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse | undefined> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "");
    const dbDocsDefUrl = `${docsDefinitionUrl}/${cleanDomain}.json`;

    const response = await fetch(
      getSignedUrl({
        url: dbDocsDefUrl,
        privateKey: process.env.CLOUDFRONT_DOCS_DEFINITION_PRIVATE_KEY || "",
        keyPairId: process.env.CLOUDFRONT_DOCS_DEFINITION_KEY_PAIR_ID || "",
        dateLessThan: new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 30
        ).toString(),
      })
    );
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
