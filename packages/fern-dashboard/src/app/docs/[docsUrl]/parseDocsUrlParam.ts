export function parseDocsUrlParam({ docsUrl }: { docsUrl: string }) {
  return decodeURIComponent(docsUrl);
}
