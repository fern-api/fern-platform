import type { DefinitionNode, NavigatableDefinitionNode } from "./types";

export function isLeafNode(node: DefinitionNode): node is NavigatableDefinitionNode {
    return node.type === "endpoint" || node.type === "webhook" || node.type === "page";
}

export function isSectionNode(
    node: DefinitionNode | undefined
): node is DefinitionNode.ApiSection | DefinitionNode.DocsSection {
    return node?.type === "api-section" || node?.type === "docs-section";
}

export function traversePreOrder(
    node: DefinitionNode,
    cb: (node: DefinitionNode, slugs: string[]) => void,
    slugs: string[] = []
): void {
    cb(node, slugs);
    if (isLeafNode(node)) {
        return;
    }
    for (const childSlug of node.childrenOrdering) {
        const childNode = node.children.get(childSlug);
        if (childNode != null) {
            const nextSlugs = [...slugs];
            if (!isSectionNode(childNode) || !childNode.section.skipUrlSlug) {
                nextSlugs.push(childNode.slug);
            }
            traversePreOrder(childNode, cb, nextSlugs);
        }
    }
}
