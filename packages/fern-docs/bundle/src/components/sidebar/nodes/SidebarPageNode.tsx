import { ReactNode } from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarPageNodeProps {
  node: FernNavigation.NavigationNodeWithMarkdown;
  icon: React.ReactNode;
  depth: number;
  className?: string;
  shallow?: boolean;
}

export function SidebarPageNode({
  node,
  icon,
  depth,
  className,
  shallow,
}: SidebarPageNodeProps): ReactNode {
  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarSlugLink
        icon={icon}
        nodeId={node.id}
        className={className}
        slug={node.slug}
        depth={Math.max(depth - 1, 0)}
        title={node.title}
        hidden={node.hidden}
        authed={node.authed}
        shallow={shallow}
      />
    </WithFeatureFlags>
  );
}
