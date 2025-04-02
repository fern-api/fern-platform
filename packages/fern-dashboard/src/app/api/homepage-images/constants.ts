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
