"use client";

import React, { ReactNode } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import {
  useIsChildSelected,
  useIsExpanded,
  useToggleSidebarNode,
} from "@/state/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { CollapsibleSidebarGroup } from "../CollapsibleSidebarGroup";
import { SidebarSlugLink } from "../SidebarLink";

export function SidebarCollapseGroup({
  node,
  icon,
  depth,
  className,
  children,
}: {
  node:
    | FernNavigation.ApiReferenceNode
    | FernNavigation.ApiPackageNode
    | FernNavigation.SectionNode;
  icon: React.ReactNode;
  depth: number;
  className?: string;
  children: ReactNode;
}): ReactNode {
  const handleToggleExpand = useToggleSidebarNode(node.id);
  const childSelected = useIsChildSelected(node.id);
  const expanded = useIsExpanded(node.id);
  const shallow = false;
  const showIndicator = childSelected && !expanded;

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <CollapsibleSidebarGroup
        open={expanded}
        trigger={
          <SidebarSlugLink
            nodeId={node.id}
            icon={icon}
            className={className}
            depth={Math.max(depth - 1, 0)}
            title={node.title}
            expanded={expanded}
            onToggleExpand={
              node.children.length > 0 ? handleToggleExpand : undefined
            }
            showIndicator={showIndicator}
            hidden={node.hidden}
            authed={node.authed}
            slug={node.overviewPageId != null ? node.slug : undefined}
            shallow={shallow}
          />
        }
      >
        {children}
      </CollapsibleSidebarGroup>
    </WithFeatureFlags>
  );
}
