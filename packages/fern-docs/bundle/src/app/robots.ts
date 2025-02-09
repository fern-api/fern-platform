import { getDocsDomainApp, getHostApp } from "@/server/xfernhost/app";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getSeoDisabled } from "@fern-docs/edge-config";
import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import urlJoin from "url-join";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const domain = await getDocsDomainApp();
  const host = (await getHostApp()) ?? domain;
  const basepath = (await headers()).get("x-fern-basepath") ?? "";
  const sitemap = urlJoin(withDefaultProtocol(host), basepath, "/sitemap.xml");

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
    },
    sitemap,
    host,
  };
}
