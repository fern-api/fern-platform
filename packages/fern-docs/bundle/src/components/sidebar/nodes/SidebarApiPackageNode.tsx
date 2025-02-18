"use client";

import { ReactNode, useCallback } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import {
  useIsChildSelected,
  useIsExpanded,
  useIsSelectedSidebarNode,
  useToggleSidebarNode,
} from "@/state/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { CollapsibleSidebarGroup } from "../CollapsibleSidebarGroup";
import { SidebarSlugLink } from "../SidebarLink";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";
import { SidebarGroupApiReferenceNode } from "./SidebarGroupApiReferenceNode";
import { SidebarPageNode } from "./SidebarPageNode";

export interface SidebarApiPackageNodeProps {
  node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
  depth: number;
  className?: string;
}

export function SidebarApiPackageNode({
  node,
  depth,
  className,
}: SidebarApiPackageNodeProps): ReactNode {
  const selected = useIsSelectedSidebarNode(node.id);
  const handleToggleExpand = useToggleSidebarNode(node.id);
  const childSelected = useIsChildSelected(node.id);
  const expanded = useIsExpanded(node.id);
  const shallow = false;

  const renderNode = useCallback(
    (node: FernNavigation.ApiPackageChild) => (
      <SidebarApiPackageChild node={node} depth={depth + 1} shallow={shallow} />
    ),
    [depth, shallow]
  );

  if (node.children.length === 0 && FernNavigation.hasMarkdown(node)) {
    return (
      <SidebarPageNode
        node={node}
        depth={depth}
        className={className}
        shallow={shallow}
      />
    );
  }

  if (node.children.length === 0 || (node.hidden && !childSelected)) {
    return null;
  }

  if (node.type === "apiReference" && node.hideTitle) {
    return <SidebarGroupApiReferenceNode node={node} depth={depth} />;
  }

  const showIndicator = childSelected && !expanded;

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <CollapsibleSidebarGroup<FernNavigation.ApiPackageChild>
        open={expanded}
        nodes={node.children}
        renderNode={renderNode}
      >
        <SidebarSlugLink
          nodeId={node.id}
          icon={node.icon}
          className={className}
          depth={Math.max(depth - 1, 0)}
          title={node.title}
          expanded={expanded}
          onClick={(e) => {
            if (e.isDefaultPrevented()) {
              return;
            }
            if (selected && expanded) {
              e.preventDefault();
            }
            handleToggleExpand();
          }}
          onClickIndicator={(e) => {
            handleToggleExpand();
            e.preventDefault();
          }}
          expandable={node.children.length > 0}
          showIndicator={showIndicator}
          hidden={node.hidden}
          authed={node.authed}
          slug={node.overviewPageId != null ? node.slug : undefined}
          selected={selected}
          shallow={shallow}
        />
      </CollapsibleSidebarGroup>
    </WithFeatureFlags>
  );
}
