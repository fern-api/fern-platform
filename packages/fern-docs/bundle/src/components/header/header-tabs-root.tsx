"use client";

import * as Tabs from "@radix-ui/react-tabs";

import { useCurrentTab, useCurrentTabbedNode } from "@/state/navigation";

export function HeaderTabsRoot({
  children,
  tabbedNodeId,
}: {
  children: React.ReactNode;
  tabbedNodeId: string;
}) {
  const tabbedNode = useCurrentTabbedNode();
  const currentTab = useCurrentTab();
  if (!tabbedNode || tabbedNodeId !== tabbedNode.id) {
    return null;
  }
  return (
    <Tabs.Root value={currentTab?.id} className="select-none">
      {children}
    </Tabs.Root>
  );
}
