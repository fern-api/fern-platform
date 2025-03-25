import { DocsSite } from "@fern-platform/fdr";

import { DocsUrl } from "./types";

export function getDocsSiteUrl({ mainUrl }: DocsSite): DocsUrl {
  if (mainUrl.path == null) {
    return mainUrl.domain as DocsUrl;
  }
  return `${mainUrl.domain}${mainUrl.path}` as DocsUrl;
}
