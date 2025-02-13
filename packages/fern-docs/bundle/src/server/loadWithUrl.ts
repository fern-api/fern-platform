import { notFound } from "next/navigation";

import { APIResponse, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { withoutStaging } from "@fern-docs/utils";

import { provideRegistryService } from "@/server/registry";

import { loadDocsDefinitionFromS3 } from "./loadDocsDefinitionFromS3";

export type LoadWithUrlResponse = APIResponse<
  FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
  FdrAPI.docs.v2.read.getDocsForUrl.Error
>;

/**
 * - If the token is a WorkOS token, we need to use the getPrivateDocsForUrl endpoint.
 * - Otherwise, we can use the getDocsForUrl endpoint (including custom auth).
 *
 * Note: this function cannot be stored in the data cache because the response can be > 2MB,
 */
export const loadWithUrl = async (
  domain: string
): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse> => {
  const domainWithoutStaging = withoutStaging(domain);

  let response;
  try {
    response = await loadDocsDefinitionFromS3({
      domain: domainWithoutStaging,
      docsBucketName: getDocsDefinitionBucketName(),
    });
    if (response != null) {
      return response;
    }
  } catch (error) {
    console.error("Failed to load docs definition:", error);
  }

  response = await provideRegistryService().docs.v2.read.getDocsForUrl({
    url: FdrAPI.Url(domainWithoutStaging),
  });
  if (response.ok) {
    return response.body;
  }
  console.error("Failed to load docs", {
    cause: response.error,
  });
  notFound();
};

function getDocsDefinitionBucketName() {
  return (
    process.env.DOCS_DEFINITION_S3_BUCKET_NAME ??
    "fdr-dev2-docs-definitions-public"
  );
}
