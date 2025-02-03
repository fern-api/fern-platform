import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const docs = await createCachedDocsLoader();
  const [baseUrl, files, config] = await Promise.all([
    docs.getBaseUrl(),
    docs.getFiles(),
    docs.getConfig(),
  ]);

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
