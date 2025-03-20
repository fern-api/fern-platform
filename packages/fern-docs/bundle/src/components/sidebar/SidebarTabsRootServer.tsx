import { DocsLoader } from "@/server/docs-loader";

import { SidebarTabsRoot } from "./SidebarTabsRoot";

export async function SidebarTabsRootServer({
  loader,
  children,
}: {
  loader: DocsLoader;
  children: React.ReactNode;
}) {
  const layout = await loader.getLayout();
  return (
    <SidebarTabsRoot mobileOnly={layout.tabsPlacement !== "SIDEBAR"}>
      {children}
    </SidebarTabsRoot>
  );
}
