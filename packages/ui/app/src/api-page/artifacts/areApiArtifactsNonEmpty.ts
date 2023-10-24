import * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";

export function areApiArtifactsNonEmpty(apiArtifacts: FernRegistryDocsRead.ApiArtifacts): boolean {
    return apiArtifacts.sdks.length > 0 || apiArtifacts.postman != null;
}
