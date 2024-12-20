import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ReactNode, useCallback } from "react";
import {
  useIsChildSelected,
  useIsExpandedSidebarNode,
  useIsSelectedSidebarNode,
  useToggleExpandedSidebarNode,
} from "../../atoms";
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
  const selected = useIsSelectedSidebarNode(node.id);
  const handleToggleExpand = useToggleExpandedSidebarNode(node.id);
  const childSelected = useIsChildSelected(node.id);
  const expanded = useIsExpandedSidebarNode(node.id);

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
    <CollapsibleSidebarGroup
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
        toggleExpand={handleToggleExpand}
        showIndicator={showIndicator}
        hidden={node.hidden}
        authed={node.authed}
        slug={node.overviewPageId != null ? node.slug : undefined}
        selected={selected}
      />
    </CollapsibleSidebarGroup>
  );
}
