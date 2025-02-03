import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = getDocsDomainApp();
  const host = getHostApp() ?? domain;
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
  files: Record<string, { url: string }>,
  fileId: string | undefined
) {
  if (!fileId) {
    return undefined;
  }
  return files[fileId]?.url;
}
