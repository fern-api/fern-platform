"use client";

import { ReactNode } from "react";

import { History } from "lucide-react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { useIsSelectedSidebarNode } from "@/state/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { Changelog } from "../../util/dateUtils";
import { SidebarSlugLink } from "../SidebarLink";

export interface SidebarChangelogNodeProps {
  node: FernNavigation.ChangelogNode;
  depth: number;
  className?: string;
}

export function SidebarChangelogNode({
  node,
  depth,
  className,
}: SidebarChangelogNodeProps): ReactNode {
  const selected = useIsSelectedSidebarNode(node.id);

  if (node.hidden && !selected) {
    return null;
  }

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarSlugLink
        nodeId={node.id}
        slug={node.slug}
        title={node.title}
        className={className}
        selected={selected}
        depth={Math.max(0, depth - 1)}
        icon={node.icon ?? <History className="size-icon" />}
        tooltipContent={renderChangelogTooltip(node)}
        hidden={node.hidden}
        authed={node.authed}
      />
    </WithFeatureFlags>
  );
}

function renderChangelogTooltip(
  changelog: FernNavigation.ChangelogNode
): string | undefined {
  const latestChange: FernNavigation.ChangelogEntryNode | undefined =
    changelog.children[0]?.children[0]?.children[0];

  if (latestChange == null) {
    return undefined;
  }

  return `Last updated ${Changelog.toCalendarDate(latestChange.date)}`;
}
