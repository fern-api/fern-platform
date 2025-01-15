import { FernNavigation } from "@fern-api/fdr-sdk";
import { ReactNode } from "react";
import { useIsApiReferenceShallowLink } from "../../atoms";
import { WithFeatureFlags } from "../../feature-flags/NavigationFeature";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";

interface SidebarGroupApiReferenceNodeProps {
  node: FernNavigation.ApiReferenceNode;
  depth: number;
}

export function SidebarGroupApiReferenceNode({
  node,
  depth,
}: SidebarGroupApiReferenceNodeProps): ReactNode {
  const shallow = useIsApiReferenceShallowLink(node);

  return (
    <WithFeatureFlags featureFlags={node.featureFlags}>
      <ul className="fern-sidebar-group">
        {node.children.map((child) => (
          <li key={child.id}>
            <SidebarApiPackageChild
              node={child}
              depth={depth}
              shallow={shallow}
            />
          </li>
        ))}
      </ul>
    </WithFeatureFlags>
  );
}
