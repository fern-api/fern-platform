import { ReactNode } from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { SidebarSlugLink } from "../SidebarLink";
import { ApiLeafBadge } from "./ApiLeafBadge";

export function SidebarApiLeafNode({
  node,
  depth,
  shallow,
}: {
  node: FernNavigation.NavigationNodeApiLeaf;
  depth: number;
  shallow: boolean;
}): ReactNode {
  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarSlugLink
        nodeId={node.id}
        slug={node.slug}
        title={
          <span
            className={cn({
              "line-through opacity-70": node.availability === "Deprecated",
            })}
          >
            {node.title}
          </span>
        }
        depth={Math.max(0, depth - 1)}
        hidden={node.hidden}
        authed={node.authed}
        icon={
          <ApiLeafBadge
            node={node}
            className="shrink-0"
            key={`${node.id}-badge`}
          />
        }
        shallow={shallow}
      />
    </WithFeatureFlags>
  );
}
