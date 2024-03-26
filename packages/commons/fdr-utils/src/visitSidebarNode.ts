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
                    visit(page, [...parentNodes, pageGroup]);
                }
            });
        },
        apiSection: (apiSection) => {
            apiSection.items.forEach((item) => {
                if (SidebarNode.isSubpackageSection(item)) {
                    visitSidebarNode(item, visit, [...parentNodes, apiSection]);
                } else {
                    visit(item, [...parentNodes, apiSection]);
                }
            });
            if (apiSection.changelog) {
                visit(apiSection.changelog, [...parentNodes, apiSection]);
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
