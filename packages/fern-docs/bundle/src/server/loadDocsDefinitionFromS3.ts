import { getSignedUrl } from "@aws-sdk/cloudfront-signer";
import { FdrAPI } from "@fern-api/fdr-sdk";
import { getS3KeyForV1DocsDefinition } from "@fern-api/fdr-sdk/docs";

export async function loadDocsDefinitionFromS3({
  domain,
  docsDefinitionUrl,
  request,
}: {
  domain: string;
  docsDefinitionUrl: string;
  request?: RequestInit;
}): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse | undefined> {
  try {
    const cleanDomain = domain.replace(/^https?:\/\//, "");
    const dbDocsDefUrl = `${docsDefinitionUrl}/${getS3KeyForV1DocsDefinition(cleanDomain)}`;
    const cloudfrontPrivateKey = process.env.CLOUDFRONT_PRIVATE_KEY;
    const cloudfrontKeyPairId = process.env.CLOUDFRONT_KEY_PAIR_ID;

    if (!cloudfrontPrivateKey) {
      throw new Error("Missing required CLOUDFRONT_PRIVATE_KEY");
    }
    if (!cloudfrontKeyPairId) {
      throw new Error("Missing required CLOUDFRONT_KEY_PAIR_ID");
    }
    const signedUrl = getSignedUrl({
      url: dbDocsDefUrl,
      privateKey: cloudfrontPrivateKey,
      keyPairId: cloudfrontKeyPairId,
      dateLessThan: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toString(),
    });
    const response = await fetch(signedUrl, request);
    if (response.ok) {
      console.log("Successfully loaded docs definition from S3: ", signedUrl);
      const json = await response.json();
      return json as FdrAPI.docs.v2.read.LoadDocsForUrlResponse;
    }
    throw new Error(
      `Failed to load docs definition from S3. Status: ${response.status}. Error: ${await response.text()}`
    );
  } catch (error) {
    console.error("Error loading docs definition from S3:", error);
    return undefined;
  }
}
