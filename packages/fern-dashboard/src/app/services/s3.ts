import {
  GetObjectCommand,
  HeadObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/* eslint-disable turbo/no-undeclared-env-vars */

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

export async function doesObjectExist({
  bucketName,
  objectKey,
}: {
  bucketName: string;
  objectKey: string;
}): Promise<boolean> {
  try {
    await getS3Client().send(
      new HeadObjectCommand({ Bucket: bucketName, Key: objectKey })
    );
    return true;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotFound" || error.name === "NoSuchKey") {
        return false;
      }
    }
    throw error;
  }
}

export async function getPresignedUrlForS3Object({
  bucketName,
  objectKey,
}: {
  bucketName: string;
  objectKey: string;
}): Promise<string> {
  return await getSignedUrl(
    getS3Client(),
    new GetObjectCommand({ Bucket: bucketName, Key: objectKey }),
    {
      // 7 days (maximum)
      expiresIn: 60 * 60 * 24 * 7,
    }
  );
}
