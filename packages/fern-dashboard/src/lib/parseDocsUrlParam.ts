import { DocsUrl } from "./types";

export function parseDocsUrlParam({ docsUrl }: { docsUrl: string }): DocsUrl {
  return decodeURIComponent(docsUrl) as DocsUrl;
}
