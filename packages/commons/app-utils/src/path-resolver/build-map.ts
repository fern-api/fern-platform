import type { FullSlug, ResolvedNode } from "./types";
import { joinUrlSlugs } from "./util";

export function buildNodeMap(node: ResolvedNode): Map<FullSlug, ResolvedNode> {
    const map = new Map<string, ResolvedNode>();
    traversePreOrder(node, (node, slugs) => {
        if (node.type !== "root" && node.version?.index === 0) {
            // Special handling for default version
            const [, ...slugsWithoutVersion] = slugs;
            const fullSlug = joinUrlSlugs(...slugsWithoutVersion);
            map.set(fullSlug, node);
        }
        const fullSlug = joinUrlSlugs(...slugs);
        map.set(fullSlug, node);
    });
    return map;
}

function traversePreOrder(
    node: ResolvedNode,
    cb: (node: ResolvedNode, slugs: string[]) => void,
    slugs: string[] = []
): void {
    cb(node, slugs);
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
