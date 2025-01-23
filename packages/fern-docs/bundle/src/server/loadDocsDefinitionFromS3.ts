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
    console.log("dbDocsDefUrl", dbDocsDefUrl);

    const signedUrl = getSignedUrl({
      url: dbDocsDefUrl,
      privateKey: process.env.CLOUDFRONT_PRIVATE_KEY || "",
      keyPairId: process.env.CLOUDFRONT_KEY_GROUP_ID || "",
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toString(),
    });
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
