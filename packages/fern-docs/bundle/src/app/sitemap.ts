import { DocsLoader } from "@/server/DocsLoader";
import { withPrunedNavigation } from "@/server/withPrunedNavigation";
import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { conformTrailingSlash } from "@fern-docs/utils";
import type { MetadataRoute } from "next";
import urljoin from "url-join";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const domain = getDocsDomainApp();
  const host = getHostApp() ?? domain;

  // load the root node, and prune it— sitemap should only include public routes
  const root = withPrunedNavigation(await DocsLoader.for(domain, host).root(), {
    authed: false,
  });

  // collect all indexable page slugs
  const slugs = NodeCollector.collect(root).indexablePageSlugs;

  // convert slugs to full urls
  const urls = slugs.map((slug) =>
    conformTrailingSlash(urljoin(withDefaultProtocol(domain), slug))
  );

  // TODO: update lastModified to be the date of the last commit to the page
  // and add a changeFrequency of "daily", unless it's a changelog page or blog post

  return [...urls.map((url) => ({ url }))];
}
