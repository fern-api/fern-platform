import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode } from "./types";

export function visitSidebarNode(
    node: SidebarNode | SidebarNode.Page,
    visit: (node: SidebarNode | SidebarNode.Page, parents: SidebarNode[]) => void | boolean | "skip",
    parentNodes: SidebarNode[] = [],
): boolean {
    const flag = visit(node, parentNodes);
    if (flag === true || flag == null) {
        // continue visiting
    } else if (flag === "skip") {
        // skip visiting children of this node
        return true;
    } else if (flag === false) {
        // exit
        return false;
    }

    return visitDiscriminatedUnion(node, "type")._visit<boolean>({
        pageGroup: (pageGroup) => {
            for (const page of pageGroup.pages) {
                if (page.type !== "link") {
                    const flag = visitSidebarNode(page, visit, parentNodes);
                    if (flag === false) {
                        return false;
                    }
                }
            }
            return true;
        },
        apiSection: (apiSection) => {
            for (const item of apiSection.items) {
                const flag = visitSidebarNode(item, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            if (apiSection.changelog) {
                const flag = visitSidebarNode(apiSection.changelog, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            if (apiSection.summaryPage != null) {
                const flag = visitSidebarNode(apiSection.summaryPage, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        section: (section) => {
            for (const item of section.items) {
                const flag = visitSidebarNode(item, visit, [...parentNodes, section]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        page: () => true,
        _other: () => true,
    });
}
