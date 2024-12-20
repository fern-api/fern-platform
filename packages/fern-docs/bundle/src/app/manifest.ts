import { loadWithUrl } from "@/server/loadWithUrl";
import { getDocsDomainApp } from "@/server/xfernhost/app";
import { DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";
import { notFound } from "next/navigation";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = getDocsDomainApp();

  const docs = await loadWithUrl(domain);

  if (!docs.ok) {
    notFound();
  }

  const favicon = selectFile(
    docs.body.definition.filesV2,
    docs.body.definition.config.favicon
  );

  return {
    name: docs.body.definition.config.title ?? "Documentation",
    start_url: addLeadingSlash(docs.body.baseUrl.basePath ?? ""),
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
