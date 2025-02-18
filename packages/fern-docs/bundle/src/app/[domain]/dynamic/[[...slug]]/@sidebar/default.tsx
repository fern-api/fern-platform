import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import { SidebarRootNode } from "@/components/sidebar/nodes/SidebarRootNode";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function SidebarPage({
  params,
}: {
  params: Promise<{ domain: string; slug: string[] }>;
}) {
  const { domain, slug } = await params;
  const loader = await createCachedDocsLoader(domain, await getFernToken());
  const root = await loader.getRoot();
  const findNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (findNode.type !== "found" || findNode.sidebar == null) {
    return null;
  }
  return <SidebarRootNode root={findNode.sidebar} />;
}
