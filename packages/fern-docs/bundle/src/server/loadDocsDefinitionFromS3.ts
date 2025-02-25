import "server-only";

import { cache } from "react";

import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl as getUncachedSignedUrl } from "@aws-sdk/s3-request-presigner";

import { FdrAPI } from "@fern-api/fdr-sdk";
import { getS3KeyForV1DocsDefinition } from "@fern-api/fdr-sdk/docs";

const getSignedUrl = async (
  domain: string,
  {
    Bucket,
    Key,
    expiresIn,
  }: {
    Bucket: string;
    Key: string;
    expiresIn: number;
  }
) => {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!accessKeyId || !secretAccessKey) {
    throw new Error("AWS credentials not found");
  }

  const s3Client = new S3Client({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const command = new GetObjectCommand({
    Bucket,
    Key,
  });

  return await getUncachedSignedUrl(s3Client, command, { expiresIn });
};

// this function cannot be cached because the response can be > 2MB
export const loadDocsDefinitionFromS3 = cache(
  async ({
    domain,
    docsBucketName,
  }: {
    domain: string;
    docsBucketName: string;
  }): Promise<FdrAPI.docs.v2.read.LoadDocsForUrlResponse | undefined> => {
    try {
      const cleanDomain = domain.replace(/^https?:\/\//, "");
      const s3Key = getS3KeyForV1DocsDefinition(cleanDomain);

      const signedUrl = await getSignedUrl(domain, {
        Bucket: docsBucketName,
        Key: s3Key,
        expiresIn: 60 * 60, // 1 hour
      });

      const response = await fetch(signedUrl, {
        next: { tags: [domain, "loadDocsDefinitionFromS3"] },
      });

      if (response.ok) {
        console.debug(
          "Successfully loaded docs definition from S3: ",
          signedUrl
        );
        const json = await response.json();
        return json as FdrAPI.docs.v2.read.LoadDocsForUrlResponse;
      }
      throw new Error(
        `Failed to load docs definition from S3. Status: ${response.status}. Error: ${await response.text()}`
      );
    } catch (error) {
      console.error("Error loading docs definition from S3:", error);
      return undefined;
    }
  }
);
