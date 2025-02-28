"use client";

import { ReactNode } from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { FaIcon } from "@fern-docs/components/fa-icon";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { SidebarSlugLink } from "../SidebarLink";

interface SidebarPageNodeProps {
  node: FernNavigation.NavigationNodeWithMarkdown;
  depth: number;
  className?: string;
  shallow?: boolean;
}

export function SidebarPageNode({
  node,
  depth,
  className,
  shallow,
}: SidebarPageNodeProps): ReactNode {
  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarSlugLink
        nodeId={node.id}
        className={className}
        slug={node.slug}
        depth={Math.max(depth - 1, 0)}
        title={node.title}
        icon={node.icon ? <FaIcon icon={node.icon} /> : undefined}
        hidden={node.hidden}
        authed={node.authed}
        shallow={shallow}
      />
    </WithFeatureFlags>
  );
}
