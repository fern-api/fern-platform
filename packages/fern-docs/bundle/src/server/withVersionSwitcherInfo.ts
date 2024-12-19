import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { VersionSwitcherInfo } from "@fern-platform/fdr-utils";

interface WithVersionSwitcherInfoArgs {
    /**
     * The current node to mutate the version switcher info for.
     */
    node: FernNavigation.NavigationNodeWithMetadata;

    /**
     * The parents of the current node, in descending order.
     */
    parents: readonly FernNavigation.NavigationNode[];

    /**
     * All available versions to be rendered in the version switcher.
     */
    versions: readonly FernNavigation.VersionNode[];

    /**
     * A map of slugs to nodes for ALL nodes in the tree.
     * This is used to check if a node exists in a different version.s
     */
    slugMap: Map<string, FernNavigation.NavigationNodeWithMetadata>;
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
    slugMap,
}: WithVersionSwitcherInfoArgs): VersionSwitcherInfo[] {
    const { version: currentVersion, nodes } =
        getNodesUnderCurrentVersionAscending(node, parents);

    const unversionedSlugs =
        currentVersion == null
            ? []
            : nodes
                  .filter(FernNavigation.hasMetadata)
                  .map((node) => node.slug)
                  .map((slug) =>
                      FernNavigation.utils.toUnversionedSlug(
                          slug,
                          currentVersion.slug
                      )
                  );

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
                    hidden: version.hidden,
                    authed: version.authed,
                } satisfies VersionSwitcherInfo;
            }

            const expectedSlugs = unversionedSlugs.map((slug) =>
                FernNavigation.slugjoin(version.slug, slug)
            );

            const expectedSlug = expectedSlugs
                .map((slug) => {
                    const node = slugMap.get(slug);

                    // if the node doesn't exist in this version, return undefined
                    if (node == null) {
                        return undefined;
                    }

                    // if the node is a visitable page, return the slug
                    else if (FernNavigation.isPage(node)) {
                        return node.slug;
                    }

                    // if the node is a redirect, return the slug it points to (which can be undefined)
                    else if (FernNavigation.hasRedirect(node)) {
                        return node.pointsTo;
                    }

                    return undefined;
                })
                // select the first non-nullish slug
                .filter(isNonNullish)[0];

            // if the same page exists in this version, return the full slug of that page, otherwise default to version's landing page (pointsTo)
            const pointsTo = expectedSlug ?? version.pointsTo;

            return {
                title: version.title,
                id: version.versionId,
                slug: version.slug,
                pointsTo,
                index,
                availability: version.availability,
                hidden: version.hidden,
                authed: version.authed,
            } satisfies VersionSwitcherInfo;
        });
}

/**
 * This function returns the current node + all parents under the current version, in ascending order
 *
 * ascending order = from the current node to its ancestors
 *
 * @internal visibleForTesting
 */
export function getNodesUnderCurrentVersionAscending<
    NODE extends {
        type: FernNavigation.NavigationNode["type"];
    } = FernNavigation.NavigationNode,
    VERSION_NODE extends {
        type: FernNavigation.VersionNode["type"];
    } = FernNavigation.VersionNode,
>(
    node: NODE,

    /**
     * The parents of the current node should be in descending order.
     */
    parents: readonly NODE[]
): {
    version: VERSION_NODE | undefined;
    nodes: NODE[];
} {
    const currentVersionIndex = parents.findIndex(
        (node) => node.type === "version"
    );

    // if the current node is not under a version, return an empty array
    if (currentVersionIndex < 0) {
        return { version: undefined, nodes: [] };
    }

    const version = parents[currentVersionIndex];
    if (version == null || version.type !== "version") {
        return { version: undefined, nodes: [] };
    }

    parents = parents.slice(currentVersionIndex + 1);

    return {
        // this is safe because of the checks above
        version: version as unknown as VERSION_NODE,

        // reverse the array to get the nodes in ascending order
        nodes: [...parents, node].reverse(),
    };
}
