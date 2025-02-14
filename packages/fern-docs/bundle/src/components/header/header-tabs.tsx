import "server-only";

import { TabbedNode } from "@fern-api/fdr-sdk/navigation";

import { HeaderTabsList } from "./header-tabs-list";
import { HeaderTabsRoot } from "./header-tabs-root";

export function HeaderTabs({
  node,
  children,
}: {
  node: TabbedNode;
  children?: React.ReactNode;
}) {
  return (
    <HeaderTabsRoot tabbedNodeId={node.id}>
      <HeaderTabsList tabs={node.children}>{children}</HeaderTabsList>
    </HeaderTabsRoot>
  );
}
