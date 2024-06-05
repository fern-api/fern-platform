import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNodeRaw } from "./types.js";

export function visitSidebarNodeRaw(
    node: SidebarNodeRaw.VisitableNode,
    visit: (node: SidebarNodeRaw.VisitableNode, parents: SidebarNodeRaw.ParentNode[]) => void | boolean | "skip",
    parentNodes: SidebarNodeRaw.ParentNode[] = [],
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
                    const flag = visitSidebarNodeRaw(page, visit, parentNodes);
                    if (flag === false) {
                        return false;
                    }
                }
            }
            return true;
        },
        apiSection: (apiSection) => {
            for (const item of apiSection.items) {
                const flag = visitSidebarNodeRaw(item, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            if (apiSection.changelog) {
                const flag = visitSidebarNodeRaw(apiSection.changelog, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            if (apiSection.summaryPage != null) {
                const flag = visitSidebarNodeRaw(apiSection.summaryPage, visit, [...parentNodes, apiSection]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        section: (section) => {
            for (const item of section.items) {
                const flag = visitSidebarNodeRaw(item, visit, [...parentNodes, section]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        versionGroup: (versionGroup) => {
            for (const item of versionGroup.items) {
                if (item.type === "tabLink") {
                    continue;
                }
                const flag = visitSidebarNodeRaw(item, visit, [...parentNodes, versionGroup]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        tabGroup: (tabGroup) => {
            for (const item of tabGroup.items) {
                const flag = visitSidebarNodeRaw(item, visit, [...parentNodes, tabGroup]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        page: (page) => {
            if (SidebarNodeRaw.isEndpointPage(page) && page.stream != null) {
                const flag = visitSidebarNodeRaw(page.stream, visit, parentNodes);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        root: (root) => {
            for (const item of root.items) {
                if (item.type === "tabLink") {
                    continue;
                }
                const flag = visitSidebarNodeRaw(item, visit, [root, ...parentNodes]);
                if (flag === false) {
                    return false;
                }
            }
            return true;
        },
        _other: () => true,
    });
}
