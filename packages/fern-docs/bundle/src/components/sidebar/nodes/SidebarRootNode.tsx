import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { ReactElement, memo } from "react";
import { SidebarRootChild, SidebarRootChildProps } from "./SidebarRootChild";

interface SidebarRootNodeProps {
  node: FernNavigation.SidebarRootNode | undefined;
}

export const SidebarRootNode = memo(function SidebarRootNode({
  node,
}: SidebarRootNodeProps): ReactElement<any> | null {
  if (!node) {
    return null;
  }

  const children = node.children.flatMap(
    (child): SidebarRootChildProps["node"][] => {
      if (child.type !== "apiReference" || !child.hideTitle) {
        return [child];
      }

      const groups: (
        | FernNavigation.ApiReferenceNode
        | FernNavigation.ApiPackageNode
      )[] = [];

      // if the ApiReference is set to `hideTitle=true`, we need to re-group the children
      // such that the root node appears to contain a collection of api references rather than a single one
      [
        ...child.children,
        ...(child.changelog != null ? [child.changelog] : []),
      ].forEach((innerChild) => {
        if (innerChild.type === "apiPackage") {
          groups.push(innerChild);
        } else {
          let lastGroup = groups[groups.length - 1];
          if (lastGroup?.type !== "apiReference") {
            lastGroup = {
              ...child,
              // Generate a unique ID for the group
              id: FernNavigation.NodeId(`${child.id}-${groups.length}`),
              children: [],
              changelog: undefined,
            };
            groups.push(lastGroup);
          }

          if (innerChild.type === "changelog") {
            lastGroup.changelog = innerChild;
          } else {
            lastGroup.children.push(innerChild);
          }
        }
      });

      return groups;
    }
  );

  return (
    <ul className="fern-sidebar-group">
      {children.map((child) => (
        <li key={child.id} className="mt-6">
          <SidebarRootChild node={child} />
        </li>
      ))}
    </ul>
  );
});
