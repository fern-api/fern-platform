"use client";

import { ReactNode, useCallback } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FaIcon } from "@fern-docs/components/fa-icon";

import {
  useIsChildSelected,
  useIsExpanded,
  useToggleSidebarNode,
} from "@/state/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { CollapsibleSidebarGroup } from "../CollapsibleSidebarGroup";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarPageNode } from "./SidebarPageNode";

interface SidebarSectionNodeProps {
  node: FernNavigation.SectionNode;
  depth: number;
  className?: string;
}

export function SidebarSectionNode({
  node,
  className,
  depth,
}: SidebarSectionNodeProps): ReactNode {
  const handleToggleExpand = useToggleSidebarNode(node.id);
  const childSelected = useIsChildSelected(node.id);
  const expanded = useIsExpanded(node.id);

  const renderNode = useCallback(
    (node: FernNavigation.NavigationChild) => (
      <SidebarNavigationChild node={node} depth={depth + 1} />
    ),
    [depth]
  );

  if (node.children.length === 0 && FernNavigation.hasMarkdown(node)) {
    return <SidebarPageNode node={node} depth={depth} className={className} />;
  }

  if (node.children.length === 0 || (node.hidden && !childSelected)) {
    return null;
  }

  const showIndicator = childSelected && !expanded;
  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <CollapsibleSidebarGroup
        open={expanded}
        nodes={node.children}
        renderNode={renderNode}
      >
        <SidebarSlugLink
          nodeId={node.id}
          icon={node.icon ? <FaIcon icon={node.icon} /> : undefined}
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
        />
      </CollapsibleSidebarGroup>
    </WithFeatureFlags>
  );
}
