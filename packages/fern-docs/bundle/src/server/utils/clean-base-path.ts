import { slugjoin } from "@fern-api/fdr-sdk/navigation";
import { addLeadingSlash, removeTrailingSlash } from "@fern-docs/utils";

export function cleanBasePath(basePath: string | undefined) {
  const basepath = removeTrailingSlash(addLeadingSlash(slugjoin(basePath)));
  if (basepath === "/") {
    return "";
  }
  return basepath;
}
