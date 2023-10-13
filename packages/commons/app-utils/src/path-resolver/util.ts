import type { DocsNode, NavigatableDocsNode, ApiDocsNode } from "./types";

export function isApiNode(node: DocsNode): node is ApiDocsNode {
    return (
        node.type === "api-section" ||
        node.type === "api-subpackage" ||
        node.type === "top-level-endpoint" ||
        node.type === "endpoint" ||
        node.type === "top-level-webhook" ||
        node.type === "webhook"
    );
}

export function isLeafNode(node: DocsNode): node is NavigatableDocsNode {
    return (
        node.type === "top-level-endpoint" ||
        node.type === "endpoint" ||
        node.type === "top-level-webhook" ||
        node.type === "webhook" ||
        node.type === "page"
    );
}

export function isSectionNode(node: DocsNode | undefined): node is DocsNode.ApiSection | DocsNode.DocsSection {
    return node?.type === "api-section" || node?.type === "docs-section";
}

export function traversePreOrder(
    node: DocsNode,
    cb: (node: DocsNode, slugs: string[]) => void,
    slugs: string[] = []
): void {
    cb(node, slugs);
    if (isLeafNode(node)) {
        return;
    }
    for (const childSlug of node.childrenOrdering) {
        const childNode = node.children[childSlug];
        if (childNode != null) {
            const nextSlugs = [...slugs];
            if (!isSectionNode(childNode) || !childNode.section.skipUrlSlug) {
                nextSlugs.push(childNode.slug);
            }
            traversePreOrder(childNode, cb, nextSlugs);
        }
    }
}
