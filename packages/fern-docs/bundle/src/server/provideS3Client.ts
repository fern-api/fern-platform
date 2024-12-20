import { S3Client } from "@aws-sdk/client-s3";
import { assertNonNullish } from "@fern-api/ui-core-utils";
import { once } from "./once";

export const provideS3Client = once((): S3Client | undefined => {
  try {
    assertNonNullish(
      process.env.AWS_ACCESS_KEY_ID,
      "AWS_ACCESS_KEY_ID is not set"
    );
    assertNonNullish(
      process.env.AWS_SECRET_ACCESS_KEY,
      "AWS_SECRET_ACCESS_KEY is not set"
    );
    return new S3Client({
      endpoint: process.env.AWS_S3_ENDPOINT, // this can be undefined
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  } catch (err) {
    console.error(err);
  }
  return undefined;
});
