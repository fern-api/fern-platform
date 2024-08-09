import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { last } from "lodash-es";
import { ReactElement } from "react";
import { useIsApiReferenceShallowLink } from "../../atoms";
import { SidebarApiGroupNode } from "./SidebarApiGroupNode";
import { SidebarRootApiPackageNode } from "./SidebarRootApiPackageNode";

interface SidebarRootApiReferenceNodeProps {
    node: FernNavigation.ApiReferenceNode;
}

type ApiGroupOrSection =
    | { type: "apiGroup"; children: (FernNavigation.ApiPackageChild | FernNavigation.ChangelogNode)[] }
    | FernNavigation.ApiPackageNode;

export function SidebarRootApiReferenceNode({ node }: SidebarRootApiReferenceNodeProps): ReactElement {
    const shallow = useIsApiReferenceShallowLink(node);

    if (!node.hideTitle) {
        return (
            <li key={node.id} className="mt-6">
                <SidebarRootApiPackageNode node={node} />
            </li>
        );
    }

    const groups: ApiGroupOrSection[] = [];

    [...node.children, ...(node.changelog != null ? [node.changelog] : [])].forEach((child) => {
        if (child.type === "apiPackage") {
            groups.push(child);
        } else {
            const lastGroup = last(groups);
            if (lastGroup?.type === "apiGroup") {
                lastGroup.children.push(child);
            } else {
                groups.push({ type: "apiGroup", children: [child] });
            }
        }
    });

    return (
        <>
            {groups.map((child, idx) =>
                child.type === "apiPackage" ? (
                    <li key={idx} className="mt-6">
                        <SidebarRootApiPackageNode node={child} />
                    </li>
                ) : (
                    <li key={idx} className="mt-6">
                        <SidebarApiGroupNode nodeChildren={child.children} shallow={shallow} />
                    </li>
                ),
            )}
        </>
    );
}
