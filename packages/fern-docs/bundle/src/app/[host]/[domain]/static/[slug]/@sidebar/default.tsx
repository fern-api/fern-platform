import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { SidebarTabsList } from "@/components/sidebar/SidebarTabsList";
import { SidebarTabsRoot } from "@/components/sidebar/SidebarTabsRoot";
import { SidebarRootNode } from "@/components/sidebar/nodes/SidebarRootNode";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { withPrunedNavigation } from "@/server/withPrunedNavigation";

export default async function SidebarPage({
  params,
}: {
  params: Promise<{ host: string; domain: string; slug: string }>;
}) {
  const { host, domain, slug } = await params;
  const loader = await createCachedDocsLoader(host, domain);
  const [root, layout, authState, edgeFlags] = await Promise.all([
    loader.getRoot(),
    loader.getLayout(),
    loader.getAuthState(),
    loader.getEdgeFlags(),
  ]);

  const foundNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (foundNode.type !== "found") {
    return null;
  }

  // TODO: how do we handle hidden tabs?
  const sidebar = withPrunedNavigation(foundNode.sidebar, {
    visibleNodeIds: [foundNode.node.id],
    authed: authState.authed,
    // when true, all unauthed pages are visible, but rendered with a LOCK button
    // so they're not actually "pruned" from the sidebar
    // TODO: move this out of a feature flag and into the navigation node metadata
    discoverable: edgeFlags.isAuthenticatedPagesDiscoverable
      ? (true as const)
      : undefined,
  });

  return (
    <>
      {foundNode.tabs && foundNode.tabs.length > 0 && (
        <SidebarTabsRoot mobileOnly={layout.tabsPlacement !== "SIDEBAR"}>
          <SidebarTabsList tabs={foundNode.tabs} />
        </SidebarTabsRoot>
      )}
      <SidebarRootNode root={sidebar} />
    </>
  );
}
