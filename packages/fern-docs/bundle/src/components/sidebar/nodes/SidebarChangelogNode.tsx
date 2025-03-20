"use client";

import { ReactNode } from "react";

import { History } from "lucide-react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { Changelog } from "../../util/dateUtils";
import { SidebarSlugLink } from "../SidebarLink";

export interface SidebarChangelogNodeProps {
  node: FernNavigation.ChangelogNode;
  icon: React.ReactNode;
  depth: number;
  className?: string;
}

export function SidebarChangelogNode({
  node,
  icon,
  depth,
  className,
}: SidebarChangelogNodeProps): ReactNode {
  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarSlugLink
        nodeId={node.id}
        slug={node.slug}
        title={node.title}
        className={className}
        depth={Math.max(0, depth - 1)}
        icon={icon || <History />}
        tooltipContent={renderChangelogTooltip(node)}
        hidden={node.hidden}
        authed={node.authed}
      />
    </WithFeatureFlags>
  );
}

// NOTE: this needs to be run client-side because of the date formatting
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
