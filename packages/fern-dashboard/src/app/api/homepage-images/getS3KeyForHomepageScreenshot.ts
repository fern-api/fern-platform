import { IMAGE_FILETYPE } from "./constants";
import { Theme } from "./types";

// NOTE: DO NOT CHANGE THIS LOGIC as this is the only source of truth for the
// homepage screenshot s3 key (i.e. keys are not stored in a db anywhere).
export function getS3KeyForHomepageScreenshot({
  url,
  theme,
}: {
  url: string;
  theme: Theme;
}) {
  return `${encodeURIComponent(standardizeUrl(url))}-${theme}.${IMAGE_FILETYPE}`;
}

const URL_REGEX = /^(?:https?:\/\/)?(?:www\.)?(.*[^/])(?:\/)?$/;

function standardizeUrl(url: string) {
  const match = url.match(URL_REGEX);
  const standardizedUrl = match?.[1];
  if (standardizedUrl == null) {
    throw new Error("Failed to standardize URL: " + url);
  }
  return standardizedUrl;
}
