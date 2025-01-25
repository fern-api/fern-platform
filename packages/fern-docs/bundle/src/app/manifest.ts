import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = await getDocsDomainApp();
  const host = (await getHostApp()) ?? domain;
  const docs = createCachedDocsLoader(domain, host);
  const baseUrl = await docs.getBaseUrl();
  const files = await docs.getFiles();
  const config = await docs.getConfig();

  const favicon = selectFile(files, config?.favicon);

  return {
    name: config?.title ?? "Documentation",
    start_url: addLeadingSlash(baseUrl.basePath ?? ""),
    display: "browser",
    icons: [
      favicon != null
        ? { src: favicon, sizes: "any", type: "image/x-icon" }
        : undefined,
    ].filter(isNonNullish),
  };
}

function selectFile(
  files: Record<DocsV1Read.FileId, DocsV1Read.File_>,
  fileId: DocsV1Read.FileId | undefined
) {
  if (!fileId) {
    return undefined;
  }
  return files[fileId]?.url;
}
