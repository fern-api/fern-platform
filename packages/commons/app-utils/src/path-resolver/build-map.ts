import { joinUrlSlugs } from "../slug";
import type { DefinitionNode, FullSlug, ItemSlug } from "./types";
import { isSectionNode, traversePreOrder } from "./util";

export function buildResolutionMap(tree: DefinitionNode.Root): Map<FullSlug, DefinitionNode | DefinitionNode[]> {
    const map = new Map<FullSlug, DefinitionNode | DefinitionNode[]>();

    const insertNodeIntoMap = (node: DefinitionNode, slugs: ItemSlug[]) => {
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
            insertNodeIntoMap(node, slugs);
        });
    }

    return map;
}
