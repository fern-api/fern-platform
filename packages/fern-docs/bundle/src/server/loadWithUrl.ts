import { APIResponse, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { provideRegistryService } from "@fern-docs/ui";
import { withoutStaging } from "@fern-docs/utils";
import { loadDocsDefinitionFromS3 } from "./loadDocsDefinitionFromS3";

export type LoadWithUrlResponse = APIResponse<
  FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
  FdrAPI.docs.v2.read.getDocsForUrl.Error
>;

/**
 * - If the token is a WorkOS token, we need to use the getPrivateDocsForUrl endpoint.
 * - Otherwise, we can use the getDocsForUrl endpoint (including custom auth).
 */
export async function loadWithUrl(
  domain: string
): Promise<LoadWithUrlResponse> {
  const domainWithoutStaging = withoutStaging(domain);

  let response;
  try {
    response = await loadDocsDefinitionFromS3({
      domain: domainWithoutStaging,
      docsBucketName: getDocsDefinitionBucketName(),
    });
    if (response != null) {
      return {
        ok: true,
        body: response,
      };
    }
  } catch (error) {
    console.error("Failed to load docs definition:", error);
    response = null;
  }

  return provideRegistryService().docs.v2.read.getDocsForUrl({
    url: FdrAPI.Url(domainWithoutStaging),
  });
}

function getDocsDefinitionBucketName() {
  return (
    process.env.NEXT_PUBLIC_DOCS_DEFINITION_S3_BUCKET_NAME ??
    "fdr-dev2-docs-definitions-public"
  );
}
