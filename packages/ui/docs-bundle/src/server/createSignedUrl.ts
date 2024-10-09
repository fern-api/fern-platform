import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { assertNonNullish } from "@fern-api/ui-core-utils";
import { provideS3Client } from "./provideS3Client";

export const createPutSignedUrl = async (key: string, expiresIn: number = 60): Promise<string> => {
    const s3Client = provideS3Client();
    assertNonNullish(s3Client, "S3 client is not available");
    assertNonNullish(process.env.AWS_S3_BUCKET_NAME, "AWS_S3_BUCKET_NAME is not set");
    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
};

export const createGetSignedUrl = async (key: string, expiresIn: number = 60): Promise<string> => {
    const s3Client = provideS3Client();
    assertNonNullish(s3Client, "S3 client is not available");
    assertNonNullish(process.env.AWS_S3_BUCKET_NAME, "AWS_S3_BUCKET_NAME is not set");
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
    });
    return getSignedUrl(s3Client, command, { expiresIn });
};
