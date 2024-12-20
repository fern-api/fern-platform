import { FernNavigation } from "@fern-api/fdr-sdk";
import { ReactNode } from "react";
import { useIsApiReferenceShallowLink } from "../../atoms";
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
  );
}
