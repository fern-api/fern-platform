import "server-only";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import { SidebarTabsList } from "@/components/sidebar/SidebarTabsList";
import { SidebarTabsRootServer } from "@/components/sidebar/SidebarTabsRootServer";
import { SidebarRootNode } from "@/components/sidebar/nodes/SidebarRootNode";
import { createCachedDocsLoader } from "@/server/docs-loader";

export default async function SidebarPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug } = await params;
  const loader = await createCachedDocsLoader(
    host,
    domain,
    await getFernToken()
  );

  const rootPromise = loader.getRoot();

  // preload:
  await loader.getLayout();
  await loader.getAuthState();
  await loader.getEdgeFlags();

  const foundNode = FernNavigation.utils.findNode(
    await rootPromise,
    slugjoin(slug)
  );
  if (foundNode.type !== "found") {
    return null;
  }

  // these are all the "visible" nodes to prevent pruning if any of these nodes are hidden
  const visibleNodeIds = [
    ...foundNode.parents.map((node) => node.id),
    foundNode.node.id,
  ];

  return (
    <>
      {foundNode.tabs && foundNode.tabs.length > 0 && (
        <SidebarTabsRootServer loader={loader}>
          <SidebarTabsList tabs={foundNode.tabs} />
        </SidebarTabsRootServer>
      )}
      <SidebarRootNode
        root={foundNode.sidebar}
        visibleNodeIds={visibleNodeIds}
        loader={loader}
      />
    </>
  );
}
