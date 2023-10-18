import type { DocsNode, FullSlug, NodeNeighbors, ParentDocsNode } from "./types";
import { getFullSlugForNavigatable } from "./util/slug";
import { isNavigatableNode } from "./util/tree";

// This is the algorithm from the previous resolver, adjusted to versions and tabs.
// We may need to revise it.
export function buildNodeToNeighborsMap(root: DocsNode.Root): Map<string, NodeNeighbors> {
    const map = new Map<FullSlug, NodeNeighbors>();

    if (root.info.type === "versioned") {
        root.info.versions.forEach((v) => {
            if (v.tabInfo.type === "tabbed") {
                v.tabInfo.tabs.forEach((t) => {
                    populateNeighbors(getOrderedNodeChildren(t), map);
                });
            } else {
                populateNeighbors(getOrderedNodeChildren(v), map);
            }
        });
    } else {
        const children = getOrderedNodeChildren(root);
        const hasTabs = children.some((c) => c.type === "tab");
        if (hasTabs) {
            children.forEach((c) => {
                if (c.type === "tab") {
                    populateNeighbors(getOrderedNodeChildren(c), map);
                }
            });
        } else {
            populateNeighbors(children, map);
        }
    }

    return map;
}

function getOrderedNodeChildren(node: ParentDocsNode) {
    const children: DocsNode[] = [];
    for (const childSlug of node.childrenOrdering) {
        const child = node.children[childSlug];
        if (child != null) {
            children.push(child);
        }
    }
    return children;
}

function populateNeighbors(unversionedAndUntabbedRootNodes: DocsNode[], map: Map<FullSlug, NodeNeighbors>) {
    const nodesInOrder = traverseInOrder(unversionedAndUntabbedRootNodes);
    let indexOfPreviousNavigatable = -1,
        indexOfPreviousPreviousNavigatable = -1,
        indexOfNextNavigatable = getIndexOfFirstNavigatable(nodesInOrder, { startingAt: 0 });

    for (const [index, node] of nodesInOrder.entries()) {
        const newIndexOfNextNavigatable =
            index === indexOfNextNavigatable
                ? getIndexOfFirstNavigatable(nodesInOrder, { startingAt: index + 1 })
                : indexOfNextNavigatable;

        let previousNavigatable = nodesInOrder[indexOfPreviousNavigatable];
        const nextNavigatable = nodesInOrder[newIndexOfNextNavigatable];

        const apiSlug = getApiSlug(node);
        if (apiSlug != null && previousNavigatable != null) {
            const apiSlugOfPrevious = getApiSlug(previousNavigatable);
            if (apiSlugOfPrevious === apiSlug) {
                previousNavigatable = nodesInOrder[indexOfPreviousPreviousNavigatable];
            }
        }

        if (isNavigatableNode(node)) {
            map.set(getFullSlugForNavigatable(node), {
                previous: previousNavigatable ?? null,
                next: nextNavigatable ?? null,
            });
        }

        if (newIndexOfNextNavigatable > indexOfNextNavigatable) {
            indexOfPreviousPreviousNavigatable = indexOfPreviousNavigatable;
            indexOfPreviousNavigatable = index;
            indexOfNextNavigatable = newIndexOfNextNavigatable;
        }
    }
}

function traverseInOrder(nodes: DocsNode[]): DocsNode[] {
    const inOrder: DocsNode[] = [];

    for (const node of nodes) {
        inOrder.push(node);
        switch (node.type) {
            case "docs-section":
            case "api-section":
            case "api-subpackage":
                inOrder.push(...traverseInOrder(Object.values(node.children)));
                break;
            case "page":
            case "top-level-endpoint":
            case "top-level-webhook":
            case "endpoint":
            case "webhook":
                break;
        }
    }

    return inOrder;
}

function isFirstSubpackageInApi(_: DocsNode.ApiSubpackage | DocsNode.TopLevelEndpoint | DocsNode.TopLevelWebhook) {
    // TODO: Implement
    return true;
}

function getIndexOfFirstNavigatable(nodes: DocsNode[], { startingAt }: { startingAt: number }): number {
    for (const [i, node] of nodes.slice(startingAt).entries()) {
        switch (node.type) {
            case "page":
                return startingAt + i;
            case "top-level-endpoint":
            case "top-level-webhook":
            case "api-subpackage":
                if (isFirstSubpackageInApi(node)) {
                    return startingAt + i;
                }
                break;
            case "api-section":
            case "endpoint":
            case "webhook":
            case "docs-section":
                break;
        }
    }
    return nodes.length;
}

function getApiSlug(node: DocsNode): string | undefined {
    switch (node.type) {
        case "api-section":
        case "api-subpackage":
        case "top-level-endpoint":
        case "top-level-webhook":
        case "endpoint":
        case "webhook":
            return node.section.skipUrlSlug ? "" : node.section.urlSlug;
        default:
            return undefined;
    }
}
