import { FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { createRoleFacet } from "../roles/create-role-facet.js";
import { flipAndOrToOrAnd, modifyRolesForEveryone } from "../roles/role-utils.js";
import { BaseRecord } from "../types.js";

interface CreateBaseRecordOptions {
    domain: string;
    org_id: string;
    parents: readonly FernNavigation.NavigationNodeParent[];
    node: FernNavigation.NavigationNodeWithMarkdown | FernNavigation.NavigationNodeApiLeaf;
    authed: boolean;
}

export function createBaseRecord({
    domain,
    org_id,
    parents,
    node,
    authed: isDocsSiteAuthed,
}: CreateBaseRecordOptions): BaseRecord {
    const productNode = parents.find((n): n is FernNavigation.ProductNode => n.type === "product");
    const versionNode = parents.find((n): n is FernNavigation.VersionNode => n.type === "version");
    const tabNode = parents.find((n): n is FernNavigation.TabNode => n.type === "tab");
    const sidebarRootIdx = parents.findIndex((n): n is FernNavigation.SidebarRootNode => n.type === "sidebarRoot");

    const breadcrumb = parents
        // we don't want to include the product, version, or tab in the breadcrumb
        .slice(sidebarRootIdx + 1)
        .filter((n): n is Extract<FernNavigation.NavigationNodeWithMetadata, FernNavigation.NavigationNodeParent> =>
            FernNavigation.hasMetadata(n),
        )
        .map((metadata) => ({
            title: metadata.title,
            pathname: addLeadingSlash(metadata.canonicalSlug ?? metadata.slug),
        }));

    const { roles, authed } = createViewersForNodes([...parents, node], isDocsSiteAuthed);

    return {
        objectID: `${org_id}:${domain}:${node.id}`,
        org_id,
        domain,
        pathname: addLeadingSlash(node.canonicalSlug ?? node.slug),
        page_title: node.title,
        breadcrumb,
        product: productNode ? { id: productNode.productId, title: productNode.title } : undefined,
        version: versionNode ? { id: versionNode.versionId, title: versionNode.title } : undefined,
        tab: tabNode ? { title: tabNode.title } : undefined,
        visible_by: roles.map(createRoleFacet),
        authed,
    };
}

/**
 * @param nodes - the parents and the node itself
 * @param authed - whether the docs site has auth enabled. If false, we assume the default case that all records should be visible to everyone.
 * @returns a OR list of AND'd roles, or [[EVERYONE_ROLE]] if the list is empty AND the docs site does not have auth enabled.
 */
function createViewersForNodes(
    nodes: readonly FernNavigation.NavigationNode[],
    authed: boolean,
): {
    roles: string[][];
    authed: boolean;
} {
    let nodesWithMetadata = nodes.filter(FernNavigation.hasMetadata);
    const lastOrphanedIdx = nodesWithMetadata.findLastIndex((n) => n.orphaned);
    if (lastOrphanedIdx >= 0) {
        nodesWithMetadata = nodesWithMetadata.slice(lastOrphanedIdx);
    }
    const viewersHierarchy = nodesWithMetadata
        .map((node) => node.viewers)
        .filter(isNonNullish)
        .filter((viewers) => viewers.length > 0);

    const requiredRoles = flipAndOrToOrAnd(viewersHierarchy);

    return modifyRolesForEveryone(requiredRoles, authed);
}
