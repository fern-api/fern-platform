import { DocsUrl } from "./types";

export function constructDocsUrlParam(docsUrl: DocsUrl) {
  return encodeURIComponent(docsUrl);
}
