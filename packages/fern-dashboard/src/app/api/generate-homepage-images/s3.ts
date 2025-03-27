/* eslint-disable turbo/no-undeclared-env-vars */
import { S3Client } from "@aws-sdk/client-s3";

let s3: S3Client | undefined;

export function getS3Client() {
  if (s3 == null) {
    if (process.env.S3_ACCESS_KEY_ID == null) {
      throw new Error("S3_ACCESS_KEY_ID is not defined in the environment");
    }
    if (process.env.S3_SECRET_ACCESS_KEY == null) {
      throw new Error("S3_SECRET_ACCESS_KEY is not defined in the environment");
    }
    s3 = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3;
}
