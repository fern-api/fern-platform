"use client";

import {
  AllSidebarExpandedNodesAtomContext,
  atomWithNavigationRootNode,
  foundNodeAtom,
  rootNodeAtom,
} from "@/state/sidebar-atom";
import { FernNavigation } from "@fern-api/fdr-sdk";
import { slugjoin, utils, type RootNode } from "@fern-api/fdr-sdk/navigation";
import { FernScrollArea } from "@fern-docs/components";
import { useHydrateAtoms } from "jotai/utils";
import { usePathname } from "next/navigation";
import React from "react";
import { useMemoOne } from "use-memo-one";

export default function Sidebar({
  root,
  sidebarWidth,
  pageWidth,
  fixed,
  children,
  initialNodeId,
}: {
  root: RootNode;
  sidebarWidth: number;
  pageWidth: number | undefined;
  fixed: boolean;
  children: React.ReactNode;
  initialNodeId: FernNavigation.NodeId | undefined;
}) {
  // this component must be rendered ONLY ONCE (nested inside of a layout.tsx)
  // otherwise this atom will be recreated and the sidebar will reset
  const parentAtom = useMemoOne(
    () => atomWithNavigationRootNode(initialNodeId, root),
    [root?.id]
  );

  const slug = slugjoin(usePathname());
  const nodeToFind = utils.findNode(root, slug);
  const foundNode = nodeToFind.type === "found" ? nodeToFind : undefined;
  useHydrateAtoms(
    [
      [rootNodeAtom, root],
      [foundNodeAtom, foundNode],
    ],
    { dangerouslyForceHydrate: true }
  );

  return (
    <AllSidebarExpandedNodesAtomContext.Provider value={parentAtom}>
      <nav
        role="navigation"
        aria-label="sidebar"
        className="shrink-0 bg-[var(--sidebar-background)]"
        style={{
          position: fixed ? "fixed" : "sticky",
          top: `var(--header-height)`,
          height: `calc(100dvh - var(--header-height))`,
          maxHeight: fixed ? undefined : "fit-content",
          width: pageWidth
            ? `calc(${sidebarWidth}px + max(calc((100dvw - ${pageWidth}px) / 2), 0px))`
            : sidebarWidth,
          paddingLeft: pageWidth
            ? `max(calc((100dvw - ${pageWidth}px) / 2), 0px)`
            : 0,
          zIndex: 20,
        }}
      >
        <FernScrollArea className="overscroll-y-contain pb-12 pl-5 pr-4">
          {children}
        </FernScrollArea>
      </nav>
    </AllSidebarExpandedNodesAtomContext.Provider>
  );
}
