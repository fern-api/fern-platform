import type { DocsNode, FullSlug, ItemSlug } from "./types";
import { joinUrlSlugs } from "./util/slug";
import { isSectionNode, traversePreOrder } from "./util/tree";

function getBaseSlug(basePath: string | undefined) {
    let slug = basePath?.trim() ?? "";
    if (slug.startsWith("/")) {
        slug = slug.slice(1);
    }
    if (slug.endsWith("/")) {
        slug = slug.slice(0, slug.length - 1);
    }
    return slug;
}

export function buildResolutionMap(
    tree: DocsNode.Root,
    basePath: string | undefined,
): Map<FullSlug, DocsNode | DocsNode[]> {
    const map = new Map<FullSlug, DocsNode | DocsNode[]>();

    const baseSlug = getBaseSlug(basePath);

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

    traversePreOrder(
        tree,
        (node, slugs) => {
            if (isSectionNode(node) && node.section.skipUrlSlug) {
                return;
            }
            insertNodeIntoMap(node, slugs);
        },
        [baseSlug],
    );

    if (tree.info.type === "versioned") {
        const { defaultVersionNode } = tree.info;
        traversePreOrder(
            defaultVersionNode,
            (node, slugs) => {
                if (Object.is(node, defaultVersionNode)) {
                    return;
                }
                if (isSectionNode(node) && node.section.skipUrlSlug) {
                    return;
                }
                insertNodeIntoMap(node, slugs);
            },
            [baseSlug],
        );
    }

    return map;
}
