import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { VersionSwitcherInfo } from "@fern-ui/fdr-utils";

interface WithVersionSwitcherInfoArgs {
    /**
     * The current node to mutate the version switcher info for.
     */
    node: FernNavigation.NavigationNodeWithMetadata;

    /**
     * The parents of the current node.
     */
    parents: readonly FernNavigation.NavigationNode[];

    /**
     * All available versions to be rendered in the version switcher.
     */
    versions: readonly FernNavigation.VersionNode[];

    /**
     * @param slug which is constructed via joining the version slug and the unversioned slug.
     * @returns whether or not the slug exists in the navigation tree.
     */
    slugExists: (slug: FernNavigation.Slug) => boolean;
}

/**
 * In order to preserve the "context" of the current node when switching between versions, we need to check if
 * the current node exists in the other versions. If it doesn't, we can traverse up the tree to find the closest
 * page that exists on that version.
 *
 * For example, if the current node is `/docs/v1/foo/bar`, and the user switches to `/docs/v2`, we need to find
 * if `/docs/v2/foo/bar` exists. If it doesn't, we can try `/docs/v2/foo` and so on.
 *
 * ASSUMPTIONS:
 * This function relies on the slug and parent slugs to match between the versions.
 * If the slug is overridden in frontmatter, there is not currently a way to determine the correct slug to switch to.
 */
export function withVersionSwitcherInfo({
    node,
    parents,
    versions,
    slugExists,
}: WithVersionSwitcherInfoArgs): VersionSwitcherInfo[] {
    const { version: currentVersion, nodes } = getNodesUnderCurrentVersionAscending(node, parents);

    const unversionedSlugs =
        currentVersion == null
            ? []
            : nodes
                  .filter(FernNavigation.hasMetadata)
                  .map((node) => node.slug)
                  .map((slug) => FernNavigation.utils.toUnversionedSlug(slug, currentVersion.slug));

    return versions
        .filter((version) => !version.hidden)
        .map((version, index) => {
            if (version.id === currentVersion?.id) {
                return {
                    title: version.title,
                    id: version.versionId,
                    slug: version.slug,

                    // the current version should always point to the current node
                    pointsTo: node.slug,
                    index,
                    availability: version.availability,
                };
            }

            // if the same page exists in multiple versions, return the full slug of that page, otherwise default to version's landing page (pointsTo)
            const expectedSlugs = unversionedSlugs.map((slug) => FernNavigation.slugjoin(version.slug, slug));
            const pointsTo = expectedSlugs.find(slugExists) ?? version.pointsTo;

            return {
                title: version.title,
                id: version.versionId,
                slug: version.slug,
                pointsTo,
                index,
                availability: version.availability,
            };
        });
}

/**
 * @internal
 */
export function getNodesUnderCurrentVersionAscending(
    node: FernNavigation.NavigationNode,
    parents: readonly FernNavigation.NavigationNode[],
): {
    version: FernNavigation.VersionNode | undefined;
    nodes: FernNavigation.NavigationNode[];
} {
    const currentVersionIndex = parents.findIndex(FernNavigation.isVersionNode);

    // if the current node is not under a version, return an empty array
    if (currentVersionIndex < 0) {
        return { version: undefined, nodes: [] };
    }

    const version = parents[currentVersionIndex] as FernNavigation.VersionNode;

    parents = parents.slice(currentVersionIndex + 1);

    return { version, nodes: [...parents, node].reverse() };
}
