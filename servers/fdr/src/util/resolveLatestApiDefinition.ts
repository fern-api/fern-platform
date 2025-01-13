import { FdrAPI } from "@fern-api/fdr-sdk";
import { S3Service } from "../services/s3/S3Service";
import { readBuffer } from "./serde";

export async function resolveLatestApiDefinition(
  apiDefinition: {
    s3Key: string | null;
    definition: Buffer | null;
  },
  s3Service: S3Service
): Promise<FdrAPI.api.latest.ApiDefinition | undefined> {
  if (apiDefinition.s3Key != null) {
    const url = await s3Service.getPresignedDocsAssetsDownloadUrl({
      key: apiDefinition.s3Key,
      isPrivate: true,
    });
    const response = await fetch(url.toString());
    const fetchedApiDefinition = await response.json();
    return fetchedApiDefinition as FdrAPI.api.latest.ApiDefinition;
  } else {
    return apiDefinition.definition != null
      ? (readBuffer(
          apiDefinition.definition
        ) as FdrAPI.api.latest.ApiDefinition)
      : undefined;
  }
}
