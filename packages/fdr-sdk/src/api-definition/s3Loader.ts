import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { FdrAPI } from "../client";
import { LatestApiDefinition } from "./latest";

export class S3Loader {
  private s3Client: S3Client | undefined;
  private bucketName: string | undefined;

  constructor() {
    if (
      process.env.AWS_ACCESS_KEY_ID != null &&
      process.env.AWS_SECRET_ACCESS_KEY != null &&
      process.env.AWS_REGION != null &&
      process.env.AWS_S3_BUCKET_NAME != null
    ) {
      this.s3Client = new S3Client({
        region: process.env.AWS_REGION,
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
      });
      this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    }
  }

  async loadApiDefinition(
    apiDefinitionOrKey: LatestApiDefinition
  ): Promise<FdrAPI.api.latest.ApiDefinition> {
    if (this.s3Client == null) {
      throw new Error("S3 client not initialized");
    }

    let resolvedApi: FdrAPI.api.latest.ApiDefinition;
    if (typeof apiDefinitionOrKey === "string") {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
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
