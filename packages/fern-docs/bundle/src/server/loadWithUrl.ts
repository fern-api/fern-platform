import "server-only";

import { APIResponse, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { removeTrailingSlash, withoutStaging } from "@fern-docs/utils";
import { loadDocsDefinitionFromS3 } from "./loadDocsDefinitionFromS3";

export type LoadWithUrlResponse = APIResponse<
  FdrAPI.docs.v2.read.LoadDocsForUrlResponse,
  Error
>;

/**
 * - If the token is a WorkOS token, we need to use the getPrivateDocsForUrl endpoint.
 * - Otherwise, we can use the getDocsForUrl endpoint (including custom auth).
 */
export async function loadWithUrl(
  domain: string,
  request?: Omit<RequestInit, "body">
): Promise<LoadWithUrlResponse> {
  const domainWithoutStaging = withoutStaging(domain);

  let loadDocsForUrlResponse:
    | FdrAPI.docs.v2.read.LoadDocsForUrlResponse
    | undefined;
  try {
    loadDocsForUrlResponse = await loadDocsDefinitionFromS3({
      domain: domainWithoutStaging,
      docsDefinitionUrl: getDocsDefinitionUrl(),
      request,
    });
    if (loadDocsForUrlResponse != null) {
      return { ok: true, body: loadDocsForUrlResponse };
    }
  } catch (error) {
    console.error("Failed to load docs definition:", error);
  }

  const response = await fetch(
    `${getEnvironment()}/v2/registry/docs/load-with-url`,
    {
      ...request,
      method: "POST",
      body: JSON.stringify({ url: domainWithoutStaging }),
      headers: {
        Authorization: `Bearer ${process.env.FERN_TOKEN}`,
        "Content-Type": "application/json",
        ...request?.headers,
      },
    }
  );

  if (!response.ok) {
    return {
      ok: false,
      error: new Error(
        `(${response.status}) ${response.statusText}: ${await response.text()}`
      ),
    };
  }

  const body = await response.json();
  return { ok: true, body };
}

function getDocsDefinitionUrl() {
  return (
    process.env.NEXT_PUBLIC_DOCS_DEFINITION_S3_URL ??
    "https://docs-definitions.buildwithfern.com"
  );
}

function getEnvironment() {
  return removeTrailingSlash(
    withDefaultProtocol(
      process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    )
  );
}
