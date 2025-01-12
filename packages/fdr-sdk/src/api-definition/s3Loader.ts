import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FdrAPI } from "../client";
import { LatestApiDefinition } from "./latest";

export class S3Loader {
  private s3Client: S3Client;

  constructor() {
    if (
      process.env.S3_API_DEFINITIONS_URL != null &&
      process.env.S3_API_DEFINITIONS_REGION != null &&
      process.env.S3_API_DEFINITIONS_ACCESS_KEY_ID != null &&
      process.env.S3_API_DEFINITIONS_SECRET_ACCESS_KEY != null &&
      process.env.S3_API_DEFINITIONS_BUCKET_NAME != null
    ) {
      this.s3Client = new S3Client({
        endpoint: process.env.S3_API_DEFINITIONS_URL,
        region: process.env.S3_API_DEFINITIONS_REGION,
        credentials: {
          accessKeyId: process.env.S3_API_DEFINITIONS_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_API_DEFINITIONS_SECRET_ACCESS_KEY,
        },
      });
    } else {
      throw new Error("Missing S3 API definitions configuration in env vars");
    }
  }

  async loadApiDefinition(
    apiDefinitionOrKey: LatestApiDefinition
  ): Promise<FdrAPI.api.latest.ApiDefinition> {
    let resolvedApi: FdrAPI.api.latest.ApiDefinition;
    if (typeof apiDefinitionOrKey === "string") {
      const command = new GetObjectCommand({
        Bucket: process.env.S3_API_DEFINITIONS_BUCKET_NAME,
        Key: apiDefinitionOrKey,
      });
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 604800,
      });
      resolvedApi = await (await fetch(url)).json();
    } else {
      resolvedApi = apiDefinitionOrKey;
    }

    return resolvedApi;
  }
}
