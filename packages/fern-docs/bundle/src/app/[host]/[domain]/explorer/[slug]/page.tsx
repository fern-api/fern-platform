import "server-only";

import { Metadata } from "next";
import { redirect } from "next/navigation";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { conformTrailingSlash } from "@fern-docs/utils";

import { getFernToken } from "@/app/fern-token";
import {
  ExplorerContent,
  NoEndpointSelected,
} from "@/components/playground/ExplorerContent";
import { conformExplorerRoute } from "@/components/playground/utils/explorer-route";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function Page(props: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug: slugProp } = await props.params;
  console.debug(`[${domain}] Loading API Explorer page`);

  const slug = FernNavigation.slugjoin(slugProp);
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );

  console.debug(`[${loader.domain}] Loading API Explorer for slug: ${slug}`);
  const root = await loader.getRoot();

  const found = FernNavigation.utils.findNode(root, slug);
  if (found.type !== "found") {
    if (found.redirect) {
      console.log(
        `[${loader.domain}] Redirecting from ${slug} to ${found.redirect}`
      );
      // follows the route path hierarchy
      redirect(conformTrailingSlash(conformExplorerRoute(found.redirect)));
    }

    console.error(`[${loader.domain}] Could not find node for slug: ${slug}`);
    return <NoEndpointSelected />;
  }
  const node = found.node;
  if (!FernNavigation.isApiLeaf(node)) {
    console.error(`[${loader.domain}] Found non-leaf node for slug: ${slug}`);
    return <NoEndpointSelected />;
  }

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
