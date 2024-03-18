import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { SidebarNode } from "./types";

function matchSlug(slug: string[], nodeSlug: string[]): boolean {
    for (let i = 0; i < slug.length; i++) {
        if (slug[i] !== nodeSlug[i]) {
            return false;
        }
    }
    return true;
}

interface TraverseState {
    prev: SidebarNode.Page | undefined;
    curr: SidebarNode.Page | undefined;
    sectionTitleBreadcrumbs: string[];
    next: SidebarNode.Page | undefined;
}

function visitPage(
    page: SidebarNode.Page,
    slug: string[],
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }
    if (traverseState.curr == null) {
        if (matchSlug(slug, page.slug)) {
            traverseState.curr = page;
            traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
        } else {
            traverseState.prev = page;
        }
    } else {
        traverseState.next = page;
    }
    return traverseState;
}

function visitNode(
    node: SidebarNode,
    slug: string[],
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }

    return visitDiscriminatedUnion(node, "type")._visit({
        pageGroup: (pageGroup) => {
            if (matchSlug(slug, pageGroup.slug) && slug.length < pageGroup.slug.length) {
                traverseState.curr = pageGroup.pages.find((page) => page.type === "page") as
                    | SidebarNode.Page
                    | undefined;
                traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
            }

            for (const page of pageGroup.pages) {
                if (page.type === "page") {
                    traverseState = visitPage(page, slug, traverseState, sectionTitleBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                }
            }

            return traverseState;
        },
        apiSection: (apiSection) => {
            const apiSectionBreadcrumbs = [...sectionTitleBreadcrumbs, apiSection.title];
            if (matchSlug(slug, apiSection.slug) && slug.length < apiSection.slug.length) {
                traverseState.curr = apiSection.endpoints[0] ?? apiSection.websockets[0] ?? apiSection.webhooks[0];
                traverseState.sectionTitleBreadcrumbs = apiSectionBreadcrumbs;
            }

            if (apiSection.changelog != null) {
                traverseState = visitPage(apiSection.changelog, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const endpoint of apiSection.endpoints) {
                traverseState = visitPage(endpoint, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const websocket of apiSection.websockets) {
                traverseState = visitPage(websocket, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const webhook of apiSection.webhooks) {
                traverseState = visitPage(webhook, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const subpackage of apiSection.subpackages) {
                traverseState = visitNode(subpackage, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            if (matchSlug(slug, apiSection.slug) && slug.length < apiSection.slug.length) {
                traverseState.curr = apiSection.changelog;
                traverseState.sectionTitleBreadcrumbs = apiSectionBreadcrumbs;
            }

            return traverseState;
        },
        section: (section) => {
            for (const item of section.items) {
                traverseState = visitNode(item, slug, traverseState, [...sectionTitleBreadcrumbs, section.title]);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            return traverseState;
        },
        _other: () => traverseState,
    });
}

export function visitSidebarNodes(sidebarNodes: SidebarNode[], slug: string[]): TraverseState {
    let traverseState: TraverseState = {
        prev: undefined,
        curr: undefined,
        next: undefined,
        sectionTitleBreadcrumbs: [],
    };
    for (const node of sidebarNodes) {
        traverseState = visitNode(node, slug, traverseState, []);
        if (traverseState.next != null) {
            break;
        }
    }
    return traverseState;
}

export function findApiSection(api: string, sidebarNodes: SidebarNode[]): SidebarNode.ApiSection | undefined {
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
