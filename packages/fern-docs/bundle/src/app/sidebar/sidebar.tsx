"use client";

import { slugjoin, utils, type RootNode } from "@fern-api/fdr-sdk/navigation";
import { FernScrollArea } from "@fern-docs/components";
import { usePathname } from "next/navigation";
import React from "react";

export default function Sidebar({
  root,
  sidebarWidth,
  pageWidth,
  contentWidth,
  fixed,
  tabs,
}: {
  root: RootNode;
  sidebarWidth: number;
  pageWidth: number | undefined;
  contentWidth: number;
  fixed: boolean;
  tabs: React.ReactNode;
}) {
  const slug = slugjoin(usePathname());
  const currentNode = utils.findNode(root, slug);
  if (currentNode.type !== "found") {
    return false;
  }

  if (!currentNode.sidebar) {
    return false;
  }

  return (
    <nav
      role="navigation"
      aria-label="sidebar"
      className="bg-[var(--sidebar-background)]"
      style={{
        position: fixed ? "fixed" : "sticky",
        top: "var(--header-height)",
        height: fixed ? `calc(100dvh - var(--header-height))` : "fit-content",
        width: pageWidth
          ? `calc(${sidebarWidth}px + max(calc((100dvw - ${pageWidth}px) / 2), 0px))`
          : sidebarWidth,
        paddingLeft: pageWidth
          ? `max(calc((100dvw - ${pageWidth}px) / 2), 0px)`
          : 0,
        zIndex: 30,
      }}
    >
      <FernScrollArea className="pb-12 pl-5 pr-4">{tabs}</FernScrollArea>
    </nav>
  );
}
