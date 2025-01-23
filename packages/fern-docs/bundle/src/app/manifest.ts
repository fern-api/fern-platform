import { DocsLoaderImpl } from "@/server/DocsLoaderImpl";
import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { DocsLoader } from "@fern-docs/cache";
import { addLeadingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const domain = getDocsDomainApp();
  const host = getHostApp() ?? domain;

  const docsLoader: DocsLoader = DocsLoaderImpl.for(domain, host);
  const docsConfig = await docsLoader.getDocsConfig();
  const root = await docsLoader.root();
  const favicon = docsConfig?.favicon
    ? await docsLoader.getFile(docsConfig.favicon)
    : undefined;

  return {
    name: docsConfig?.title ?? "Documentation",
    start_url: addLeadingSlash(root?.slug ?? ""),
    display: "browser",
    icons: [
      favicon != null
        ? { src: favicon.url, sizes: "any", type: "image/x-icon" }
        : undefined,
    ].filter(isNonNullish),
  };
}
