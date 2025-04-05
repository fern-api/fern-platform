import { doesObjectExist, getPresignedUrlForS3Object } from "@/app/services/s3";

import { getHomepageImagesS3BucketName } from "../constants";
import generateHomepageImages from "../generate/handler";
import { getS3KeyForHomepageScreenshot } from "../getS3KeyForHomepageScreenshot";
import { Theme } from "../types";

export default async function getHomepageImageUrl({
  urls,
  theme,
}: {
  urls: string[];
  theme: Theme;
}) {
  for (const url of urls) {
    console.debug(`Getting homepage image for ${url}`);
    const bucketName = getHomepageImagesS3BucketName();
    const objectKey = getS3KeyForHomepageScreenshot({ url, theme });

    let screenshotExists = await doesObjectExist({
      bucketName: bucketName,
      objectKey,
    });

    if (!screenshotExists) {
      try {
        await generateHomepageImages({ url });
        screenshotExists = true;
      } catch (e) {
        console.warn("Failed to generate homepage image", e);
      }
    }

    if (screenshotExists) {
      return {
        imageUrl: await getPresignedUrlForS3Object({ bucketName, objectKey }),
      };
    }
  }

  throw new Error("Failed to generate homepage images");
}
