import { FernNavigation } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last } from "lodash-es";
import { Fragment } from "react";
import { SidebarApiGroupNode } from "./SidebarApiGroupNode";
import { SidebarGroupNode } from "./SidebarGroupNode";
import { SidebarRootApiPackageNode } from "./SidebarRootApiPackageNode";
import { SidebarRootSectionNode } from "./SidebarRootSectionNode";

interface SidebarRootNodeProps {
    node: FernNavigation.SidebarRootNode;
}

type ApiGroupOrSection =
    | { type: "apiGroup"; children: (FernNavigation.ApiPackageChild | FernNavigation.ChangelogNode)[] }
    | FernNavigation.ApiPackageNode;

export function SidebarRootNode({ node }: SidebarRootNodeProps): React.ReactElement {
    return (
        <ul className="fern-sidebar-group">
            {node.children.map((child) =>
                visitDiscriminatedUnion(child, "type")._visit({
                    sidebarGroup: (group) => (
                        <li key={child.id} className="mt-6">
                            <SidebarGroupNode node={group} />
                        </li>
                    ),
                    apiReference: (apiRef) => {
                        if (!apiRef.hideTitle) {
                            return (
                                <li key={child.id} className="mt-6">
                                    <SidebarRootApiPackageNode node={apiRef} />
                                </li>
                            );
                        }

                        const groups: ApiGroupOrSection[] = [];

                        [...apiRef.children, ...(apiRef.changelog != null ? [apiRef.changelog] : [])].forEach(
                            (child) => {
                                if (child.type === "apiSection") {
                                    groups.push(child);
                                } else {
                                    const lastGroup = last(groups);
                                    if (lastGroup?.type === "apiGroup") {
                                        lastGroup.children.push(child);
                                    } else {
                                        groups.push({ type: "apiGroup", children: [child] });
                                    }
                                }
                            },
                        );

                        return (
                            <Fragment key={child.id}>
                                {groups.map((child, idx) =>
                                    child.type === "apiSection" ? (
                                        <li key={idx} className="mt-6">
                                            <SidebarRootApiPackageNode node={child} />
                                        </li>
                                    ) : (
                                        <li key={idx} className="mt-6">
                                            <SidebarApiGroupNode nodeChildren={child.children} />
                                        </li>
                                    ),
                                )}
                            </Fragment>
                        );
                    },
                    section: (section) => (
                        <li key={child.id} className="mt-6">
                            <SidebarRootSectionNode node={section} />
                        </li>
                    ),
                    _other: () => null,
                }),
            )}
        </ul>
    );
}
