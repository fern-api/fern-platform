import type { MetadataRoute } from "next";

import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp } from "@/server/xfernhost/app";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = await getDocsDomainApp();
  const loader = await createCachedDocsLoader(domain);

  const baseUrl = await loader.getBaseUrl();
  const docs = await loader.getConfig();
  const files = await loader.getFiles();
  const favicon =
    docs?.favicon != null && files[docs.favicon] != null
      ? files[docs.favicon]?.src
      : undefined;

  return {
    name: docs?.title ?? "Documentation",
    start_url: addLeadingSlash(baseUrl.basePath ?? ""),
    display: "browser",
    icons: [
      favicon != null
        ? { src: favicon, sizes: "any", type: "image/x-icon" }
        : undefined,
    ].filter(isNonNullish),
  };
}
