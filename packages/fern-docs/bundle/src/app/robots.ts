import type { MetadataRoute } from "next";
import { headers } from "next/headers";

import urlJoin from "url-join";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getSeoDisabled } from "@fern-docs/edge-config";
import { HEADER_HOST, HEADER_X_FERN_HOST } from "@fern-docs/utils";

export const runtime = "edge";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headersList = await headers();
  const domain =
    headersList.get(HEADER_X_FERN_HOST) ?? headersList.get(HEADER_HOST);
  if (!domain) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }
  const basepath = headersList.get("x-fern-basepath") ?? "";
  const sitemap = urlJoin(
    withDefaultProtocol(domain),
    basepath,
    "/sitemap.xml"
  );

  if (await getSeoDisabled(domain)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap,
      host: domain,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap,
    host: domain,
  };
}
