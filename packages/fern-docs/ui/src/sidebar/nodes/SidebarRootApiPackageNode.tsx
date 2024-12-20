import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import clsx from "clsx";
import { ReactElement } from "react";
import { useIsApiReferenceShallowLink, useIsChildSelected } from "../../atoms";
import { SidebarApiPackageChild } from "./SidebarApiPackageChild";
import { SidebarPageNode } from "./SidebarPageNode";
import { SidebarRootHeading } from "./SidebarRootHeading";

export interface SidebarRootApiPackageNodeProps {
  node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode;
  className?: string;
}

export function SidebarRootApiPackageNode({
  node,
  className,
}: SidebarRootApiPackageNodeProps): ReactElement | null {
  const childSelected = useIsChildSelected(node.id);
  const shallow = useIsApiReferenceShallowLink(node);

  if (node.children.length === 0 && FernNavigation.hasMarkdown(node)) {
    return (
      <SidebarPageNode
        node={node}
        depth={0}
        className={className}
        linkClassName="font-semibold !text-text-default"
        shallow={shallow}
      />
    );
  }

  if (node.children.length === 0 || (node.hidden && !childSelected)) {
    return null;
  }

  return (
    <>
      <SidebarRootHeading node={node} className={className} shallow={shallow} />

      <ul className={clsx("fern-sidebar-group")}>
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
    </>
  );
}
