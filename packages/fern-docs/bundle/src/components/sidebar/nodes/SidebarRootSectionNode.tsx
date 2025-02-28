import { ReactNode } from "react";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { SidebarNavigationChild } from "./SidebarNavigationChild";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarRootHeading } from "./SidebarRootHeading";

interface SidebarRootSectionNodeProps {
  node: FernNavigation.SectionNode;
  icon: React.ReactNode;
  className?: string;
}

export function SidebarRootSectionNode({
  node,
  icon,
  className,
}: SidebarRootSectionNodeProps): ReactNode {
  // If the node has no children, it is a page node.
  if (node.children.length === 0 && FernNavigation.hasMarkdown(node)) {
    return (
      <SidebarPageNode
        node={node}
        depth={0}
        className={className}
        icon={icon}
      />
    );
  }

  if (node.children.length === 0) {
    return null;
  }

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarRootHeading node={node} className={className} icon={icon} />

      <ul className="fern-sidebar-group">
        {node.children.map((child) => (
          <li key={child.id}>
            <SidebarNavigationChild node={child} depth={1} />
          </li>
        ))}
      </ul>
    </WithFeatureFlags>
  );
}
