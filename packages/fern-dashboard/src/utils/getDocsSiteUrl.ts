import { FdrAPI } from "@fern-api/fdr-sdk";

import { DocsUrl } from "./types";

export function getDocsSiteUrl({
  mainUrl,
}: FdrAPI.dashboard.DocsSite): DocsUrl {
  return convertFdrDocsSiteUrlToDocsUrl(mainUrl);
}

export function convertFdrDocsSiteUrlToDocsUrl(
  url: FdrAPI.dashboard.DocsSiteUrl
): DocsUrl {
  if (url.path == null) {
    return url.domain as DocsUrl;
  }
  return `${url.domain}${url.path}` as DocsUrl;
}
