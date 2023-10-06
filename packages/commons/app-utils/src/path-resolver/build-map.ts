import type { FullSlug, ResolvedNode } from "./types";
import { joinUrlSlugs } from "./util";

export function buildNodeMap(node: ResolvedNode): Map<FullSlug, ResolvedNode> {
    const map = new Map<string, ResolvedNode>();
    traversePreOrder(node, (node, fullSlug) => {
        map.set(fullSlug, node);
    });
    return map;
}

function traversePreOrder(
    node: ResolvedNode,
    cb: (node: ResolvedNode, fullSlug: string) => void,
    slugs: string[] = []
): void {
    cb(node, joinUrlSlugs(...slugs));
    if (node.type === "page" || node.type === "endpoint") {
        return;
    }
    for (const childSlug of node.childrenOrdering) {
        const childNode = node.children.get(childSlug);
        if (childNode != null) {
            traversePreOrder(childNode, cb, [...slugs, childNode.slug]);
        }
    }
}
