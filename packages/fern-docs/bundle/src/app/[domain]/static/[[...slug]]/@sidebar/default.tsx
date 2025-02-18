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
  const findNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  console.log(findNode);
  if (findNode.type !== "found" || findNode.sidebar == null) {
    return null;
  }
  return <SidebarRootNode root={findNode.sidebar} />;
}
