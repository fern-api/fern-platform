import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode, SidebarNodeRaw } from "./types";

function partialMatchSlug(slug: readonly string[], nodeSlug: readonly string[]): boolean {
    for (let i = 0; i < slug.length; i++) {
        if (slug[i] !== nodeSlug[i]) {
            return false;
        }
    }
    return true;
}

function matchCurrentNode(currentNode: SidebarNodeRaw.VisitableNode, page: SidebarNode.Page): boolean {
    return (
        currentNode.type === "page" && currentNode.slug.join("/") === page.slug.join("/") && currentNode.id === page.id
    );
}

interface TraverseState {
    prev: SidebarNode.Page | undefined;
    curr: SidebarNode.Page | undefined;
    sectionTitleBreadcrumbs: string[];
    next: SidebarNode.Page | undefined;
}

function visitPage(
    page: SidebarNode.Page,
    currentNode: SidebarNodeRaw.VisitableNode,
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }
    if (traverseState.curr == null) {
        if (matchCurrentNode(currentNode, page)) {
            traverseState.curr = page;
            traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
        } else {
            traverseState.prev = page;
        }
    } else {
        traverseState.next = page;
    }

    if (SidebarNode.isEndpointPage(page) && page.stream != null) {
        return visitPage(page.stream, currentNode, traverseState, sectionTitleBreadcrumbs);
    }

    return traverseState;
}

function visitNode(
    node: SidebarNode,
    currentNode: SidebarNodeRaw.VisitableNode,
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }

    return visitDiscriminatedUnion(node, "type")._visit({
        pageGroup: (pageGroup) => {
            for (const page of pageGroup.pages) {
                if (page.type === "page") {
                    traverseState = visitPage(page, currentNode, traverseState, sectionTitleBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                } else if (page.type === "section") {
                    traverseState = visitNode(page, currentNode, traverseState, sectionTitleBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                }
            }

            if (
                partialMatchSlug(currentNode.slug, pageGroup.slug) &&
                currentNode.slug.length < pageGroup.slug.length &&
                traverseState.curr == null
            ) {
                traverseState.curr = pageGroup.pages.find((page) => page.type === "page") as
                    | SidebarNode.Page
                    | undefined;
                traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
            }

            return traverseState;
        },
        apiSection: (apiSection) => {
            if (apiSection.summaryPage != null) {
                traverseState = visitPage(apiSection.summaryPage, currentNode, traverseState, sectionTitleBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            const apiSectionBreadcrumbs = [...sectionTitleBreadcrumbs, apiSection.title];

            if (apiSection.changelog != null) {
                traverseState = visitPage(apiSection.changelog, currentNode, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const apiPage of apiSection.items) {
                if (apiPage.type === "page") {
                    traverseState = visitPage(apiPage, currentNode, traverseState, apiSectionBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                } else {
                    traverseState = visitNode(apiPage, currentNode, traverseState, apiSectionBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                }
            }
            if (
                partialMatchSlug(currentNode.slug, apiSection.slug) &&
                currentNode.slug.length < apiSection.slug.length
            ) {
                traverseState.curr =
                    apiSection.changelog ?? (apiSection.items[0]?.type === "page" ? apiSection.items[0] : undefined);
                traverseState.sectionTitleBreadcrumbs = apiSectionBreadcrumbs;
            }

            return traverseState;
        },
        section: (section) => {
            for (const item of section.items) {
                traverseState = visitNode(item, currentNode, traverseState, [
                    ...sectionTitleBreadcrumbs,
                    section.title,
                ]);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            return traverseState;
        },
        _other: () => traverseState,
    });
}

export function traverseSidebarNodes(
    sidebarNodes: SidebarNode[],
    currentNode: SidebarNodeRaw.VisitableNode,
): TraverseState {
    let traverseState: TraverseState = {
        prev: undefined,
        curr: undefined,
        next: undefined,
        sectionTitleBreadcrumbs: [],
    };
    for (const node of sidebarNodes) {
        traverseState = visitNode(node, currentNode, traverseState, []);
        if (traverseState.next != null) {
            break;
        }
    }
    return traverseState;
}

export function findApiSection(
    api: string,
    sidebarNodes: readonly SidebarNodeRaw[],
): SidebarNodeRaw.ApiSection | undefined {
    for (const node of sidebarNodes) {
        if (node.type === "apiSection") {
            if (node.id === api) {
                return node;
            }
        } else if (node.type === "section") {
            const innerSection = findApiSection(api, node.items);
            if (innerSection != null) {
                return innerSection;
            }
        }
    }
    return undefined;
}
