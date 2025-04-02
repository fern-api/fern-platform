import { doesObjectExist, getPresignedUrlForS3Object } from "@/app/services/s3";

import { getHomepageImagesS3BucketName } from "../constants";
import generateHomepageImages from "../generate/handler";
import { getS3KeyForHomepageScreenshot } from "../getS3KeyForHomepageScreenshot";
import { Theme } from "../types";

export default async function getHomepageImages({
  url,
  theme,
}: {
  url: string;
  theme: Theme;
}) {
  const bucketName = getHomepageImagesS3BucketName();
  const objectKey = getS3KeyForHomepageScreenshot({ url, theme });

  const screenshotExists = await doesObjectExist({
    bucketName: bucketName,
    objectKey,
  });

  if (!screenshotExists) {
    await generateHomepageImages({ url });
  }

  return {
    imageUrl: await getPresignedUrlForS3Object({ bucketName, objectKey }),
  };
}
