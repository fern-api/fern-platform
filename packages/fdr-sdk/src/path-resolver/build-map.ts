import type { DocsNode, FullSlug, ItemSlug } from "./types";
import { joinUrlSlugs } from "./util/slug";
import { isSectionNode, traversePreOrder } from "./util/tree";

export function buildResolutionMap(tree: DocsNode.Root): Map<FullSlug, DocsNode | DocsNode[]> {
    const map = new Map<FullSlug, DocsNode | DocsNode[]>();

    const insertNodeIntoMap = (node: DocsNode, slugs: ItemSlug[]) => {
        const fullSlug = joinUrlSlugs(...slugs);
        const val = map.get(fullSlug);
        if (Array.isArray(val)) {
            val.push(node);
        } else if (val != null) {
            map.set(fullSlug, [val, node]);
        } else {
            map.set(fullSlug, node);
        }
    };

    traversePreOrder(tree, (node, slugs) => {
        if (isSectionNode(node) && node.section.skipUrlSlug) {
            return;
        }
        insertNodeIntoMap(node, slugs);
    });

    if (tree.info.type === "versioned") {
        const { defaultVersionNode } = tree.info;
        traversePreOrder(defaultVersionNode, (node, slugs) => {
            if (Object.is(node, defaultVersionNode)) {
                return;
            }
            if (isSectionNode(node) && node.section.skipUrlSlug) {
                return;
            }
            insertNodeIntoMap(node, slugs);
        });
    }

    return map;
}
