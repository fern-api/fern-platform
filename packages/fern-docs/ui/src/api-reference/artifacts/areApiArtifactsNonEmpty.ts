import type { DocsV1Read } from "@fern-api/fdr-sdk/client/types";

export function areApiArtifactsNonEmpty(
    apiArtifacts: DocsV1Read.ApiArtifacts
): boolean {
    return apiArtifacts.sdks.length > 0 || apiArtifacts.postman != null;
}
