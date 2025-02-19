import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin } from "@fern-api/fdr-sdk/navigation";

import { getFernToken } from "@/app/fern-token";
import { SidebarTabsList } from "@/components/sidebar/SidebarTabsList";
import { SidebarTabsRoot } from "@/components/sidebar/SidebarTabsRoot";
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
  const [root, layout] = await Promise.all([
    loader.getRoot(),
    loader.getLayout(),
  ]);
  const findNode = FernNavigation.utils.findNode(root, slugjoin(slug));
  if (findNode.type !== "found") {
    return null;
  }
  return (
    <>
      {findNode.tabs && findNode.tabs.length > 0 && (
        <SidebarTabsRoot mobileOnly={layout.tabsPlacement !== "SIDEBAR"}>
          <SidebarTabsList tabs={findNode.tabs} />
        </SidebarTabsRoot>
      )}
      {findNode.sidebar && <SidebarRootNode root={findNode.sidebar} />}
    </>
  );
}
