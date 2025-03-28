import { FdrAPI } from "@fern-api/fdr-sdk";

import { DocsUrl } from "./types";

export function getDocsSiteUrl({
  mainUrl,
}: FdrAPI.dashboard.DocsSite): DocsUrl {
  if (mainUrl.path == null) {
    return mainUrl.domain as DocsUrl;
  }
  return `${mainUrl.domain}${mainUrl.path}` as DocsUrl;
}
