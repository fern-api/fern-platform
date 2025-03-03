import { DocsLoader } from "@/server/DocsLoader";
import { withPrunedNavigation } from "@/server/withPrunedNavigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";

import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getSeoDisabled } from "@fern-docs/edge-config";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import urlJoin from "url-join";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = getDocsDomainApp();
  const host = getHostApp() ?? domain;
  const basepath = headers().get("x-fern-basepath") ?? "";
  const sitemap = urlJoin(withDefaultProtocol(host), basepath, "/sitemap.xml");

  const root = withPrunedNavigation(await DocsLoader.for(domain, host).root(), {
    authed: true,
    showHidden: true,
  });

  const hiddenSlugs = NodeCollector.collect(root).hiddenPageSlugs.map(
    (item) => `/${item}`
  );

  if (await getSeoDisabled(domain)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap,
      host,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: hiddenSlugs,
    },
    sitemap,
    host,
  };
}
