import "server-only";

import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { cn } from "@fern-docs/components";

import { WithFeatureFlags } from "../../feature-flags/WithFeatureFlags";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarRootHeading } from "./SidebarRootHeading";

export interface SidebarRootApiPackageNodeProps {
  node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
  icon: React.ReactNode;
  className?: string;
}

export function SidebarRootApiPackageNode({
  node,
  icon,
  className,
}: SidebarRootApiPackageNodeProps) {
  const shallow = false;

  if (node.children.length === 0 && FernNavigation.hasMarkdown(node)) {
    return (
      <SidebarPageNode
        node={node}
        depth={0}
        className={cn(className, "!text-body font-semibold")}
        shallow={shallow}
        icon={icon}
      />
    );
  }

  if (node.children.length === 0) {
    return null;
  }

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <SidebarRootHeading
        node={node}
        className={className}
        shallow={shallow}
        icon={icon}
      />

      <ul className="fern-sidebar-group">
        {node.children.map((child) => (
          <li key={child.id}>
            <SidebarApiPackageChild node={child} depth={1} shallow={shallow} />
          </li>
        ))}
        {node.type === "apiReference" && node.changelog != null && (
          <li>
            <SidebarApiPackageChild
              node={node.changelog}
              depth={1}
              shallow={shallow}
            />
          </li>
        )}
      </ul>
    </WithFeatureFlags>
  );
}
