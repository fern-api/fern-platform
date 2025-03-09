import "server-only";

import { Metadata } from "next";
import { RedirectType, redirect } from "next/navigation";
import React from "react";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { conformTrailingSlash } from "@fern-docs/utils";

import { getFernToken } from "@/app/fern-token";
import {
  ExplorerContent,
  NoEndpointSelected,
} from "@/components/playground/ExplorerContent";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function ExplorerPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug: slugProp } = await params;

  const slug = FernNavigation.slugjoin(slugProp);

  console.debug(
    `[${domain}] Loading intercepted API Explorer page for ${slug}`
  );

  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const root = await loader.getRoot();

  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    console.debug("Did not find node for slug", slug);
    if (found.redirect) {
      console.debug(
        `[${domain}] Redirecting to "${found.redirect}" in dynamic page`
      );
      // this will allow us to redirect to the correct page in the same intercepted API Explorer page
      redirect(
        conformTrailingSlash(conformExplorerRoute(found.redirect)),
        RedirectType.replace
      );
    }

    return <NoEndpointSelected />;
  }
  const node = found.node;

  return <ExplorerContent loader={loader} node={node} />;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}): Promise<Metadata> {
  const { host, domain, slug: slugProp } = await params;
  const slug = FernNavigation.slugjoin(slugProp);
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );
  const root = await loader.getRoot();
  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    return {};
  }
  return {
    title: `${found.node.title} (API Explorer)`,
  };
}
