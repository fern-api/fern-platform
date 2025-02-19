import type { MetadataRoute } from "next";

import urljoin from "url-join";

import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { conformTrailingSlash } from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";
import { getDocsDomainApp, getDocsHostApp } from "@/server/xfernhost/app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await getDocsHostApp();
  const domain = await getDocsDomainApp();
  const loader = await createCachedDocsLoader(host, domain);
  const root = await loader.getRoot();

  // collect all indexable page slugs
  const slugs = NodeCollector.collect(root).indexablePageSlugs;

  // convert slugs to full urls
  const urls = slugs.map((slug) =>
    conformTrailingSlash(urljoin(withDefaultProtocol(domain), slug))
  );

  return [...urls.map((url) => ({ url }))];
}
