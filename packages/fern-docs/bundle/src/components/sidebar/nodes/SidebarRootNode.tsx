import React from "react";

import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";

import { SetEmptySidebar } from "@/state/layout";

import { SidebarRootChild } from "./SidebarRootChild";

export function SidebarRootNode({
  root: node,
}: {
  root: FernNavigation.SidebarRootNode | undefined;
}) {
  const children =
    node?.children.flatMap(
      (child): React.ComponentProps<typeof SidebarRootChild>["node"][] => {
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
                id: `${child.id}-${groups.length}` as FernNavigation.NodeId,
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
    ) ?? [];

  return (
    <>
      <SetEmptySidebar
        value={
          children.length === 0 ||
          (children.length === 1 &&
            children[0]?.type === "sidebarGroup" &&
            children[0].children.length === 1 &&
            children[0].children[0]?.type === "page")
        }
      />
      {children.length > 0 && (
        <ul className="fern-sidebar-group fern-collapsible">
          {children.map((child) => (
            <li key={child.id} className="mt-6">
              <SidebarRootChild node={child} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
