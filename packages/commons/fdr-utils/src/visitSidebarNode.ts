import { noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode } from "./types";

export function visitSidebarNode(
    node: SidebarNode | SidebarNode.Page,
    visit: (node: SidebarNode | SidebarNode.Page, parents: SidebarNode[]) => void,
    parentNodes: SidebarNode[] = [],
): void {
    visit(node, parentNodes);
    visitDiscriminatedUnion(node, "type")._visit({
        pageGroup: (pageGroup) => {
            pageGroup.pages.forEach((page) => {
                if (page.type !== "link") {
                    visitSidebarNode(page, visit, parentNodes);
                }
            });
        },
        apiSection: (apiSection) => {
            apiSection.items.forEach((item) => {
                visitSidebarNode(item, visit, [...parentNodes, apiSection]);
            });
            if (apiSection.changelog) {
                visitSidebarNode(apiSection.changelog, visit, [...parentNodes, apiSection]);
            }
        },
        section: (section) => {
            section.items.forEach((item) => {
                visitSidebarNode(item, visit, [...parentNodes, section]);
            });
        },
        page: noop,
        _other: noop,
    });
}
