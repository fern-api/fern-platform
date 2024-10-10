import { FernNavigation } from "../..";

export function pruneVersionNode<T extends FernNavigation.NavigationNode>(
    node: T,
    rootSlug: FernNavigation.Slug,
    versionSlug: FernNavigation.Slug,
): T;
export function pruneVersionNode<T extends FernNavigation.NavigationNode>(
    node: T | undefined,
    rootSlug: FernNavigation.Slug,
    versionSlug: FernNavigation.Slug,
): T | undefined;
export function pruneVersionNode<T extends FernNavigation.NavigationNode>(
    node: T | undefined,
    rootSlug: FernNavigation.Slug,
    versionSlug: FernNavigation.Slug,
): T | undefined {
    if (node == null) {
        return undefined;
    }
    FernNavigation.traverseDF(node, (node) => {
        if (FernNavigation.hasMetadata(node)) {
            const newSlug = FernNavigation.toDefaultSlug(node.slug, rootSlug, versionSlug);
            // children of this node was already pruned
            if (node.slug === newSlug) {
                return "skip";
            }
            node.canonicalSlug = node.canonicalSlug ?? node.slug;
            node.slug = newSlug;
        }

        if (FernNavigation.hasRedirect(node)) {
            node.pointsTo = FernNavigation.toDefaultSlug(node.pointsTo, rootSlug, versionSlug);
        }
        return;
    });
    return node;
}
