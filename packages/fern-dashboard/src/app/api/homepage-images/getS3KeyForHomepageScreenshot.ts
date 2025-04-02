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
  return `${encodeURIComponent(url)}-${theme}.${IMAGE_FILETYPE}`;
}
