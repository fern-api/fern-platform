/* eslint-disable turbo/no-undeclared-env-vars */

export const IMAGE_FILETYPE = "avif";

export function getHomepageImagesS3BucketName() {
  if (process.env.HOMEPAGE_IMAGES_S3_BUCKET_NAME == null) {
    throw new Error(
      "HOMEPAGE_IMAGES_S3_BUCKET_NAME is not defined in the environment"
    );
  }
  return process.env.HOMEPAGE_IMAGES_S3_BUCKET_NAME;
}

// these are used to size the skeleton of the homepage image
export const HOMEPAGE_SCREENSHOT_WIDTH = 1300;
export const HOMEPAGE_SCREENSHOT_HEIGHT = 700;
