import { unstable_cacheLife, unstable_cacheTag } from "next/cache";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { SidebarRootNode } from "@/components/sidebar/nodes/SidebarRootNode";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function SidebarPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string[] }>;
}) {
  const { domain, slug } = await params;
  const loader = await createCachedDocsLoader(domain);
  const root = await loader.getRoot();
  const found = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (found.type !== "found") {
    return null;
  }

  const sidebarRootNodeId = found.sidebar?.id;

  if (sidebarRootNodeId == null) {
    return null;
  }

  return (
    <SidebarRootNodeServerComponent domain={domain} id={sidebarRootNodeId} />
  );
}

export async function SidebarRootNodeServerComponent({
  domain,
  id,
}: {
  domain: string;
  id: string;
}) {
  "use cache";

  unstable_cacheTag(domain);
  unstable_cacheLife("max");

  const loader = await createCachedDocsLoader(domain);

  const node = await loader.getNavigationNode(id);
  if (node.type !== "sidebarRoot") {
    throw new Error("Expected sidebarRoot node");
  }
  return <SidebarRootNode node={node} key={id} />;
}
