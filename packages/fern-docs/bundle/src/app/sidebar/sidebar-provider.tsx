"use client";

import {
  AllSidebarExpandedNodesAtomContext,
  atomWithSidebarRootNode,
  SidebarExpandedNodesAtomContext,
} from "@/state/sidebar-atom";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { useContext } from "react";
import { useMemoOne } from "use-memo-one";

export default function SidebarProvider({
  children,
  sidebarRootNodeId,
}: {
  children: React.ReactNode;
  sidebarRootNodeId: FernNavigation.NodeId;
}) {
  const parentAtom = useContext(AllSidebarExpandedNodesAtomContext);

  const childAtom = useMemoOne(
    () => atomWithSidebarRootNode(parentAtom, sidebarRootNodeId),
    [parentAtom, sidebarRootNodeId]
  );
  return (
    <SidebarExpandedNodesAtomContext.Provider value={childAtom}>
      {children}
    </SidebarExpandedNodesAtomContext.Provider>
  );
}
