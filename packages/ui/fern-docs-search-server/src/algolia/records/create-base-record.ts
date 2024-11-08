import { FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { createRoleFacet } from "../roles/create-role-facet";
import { flipAndOrToOrAnd, modifyRolesForEveryone } from "../roles/role-utils";
import { BaseRecord } from "../types";

interface CreateBaseRecordOptions {
    domain: string;
    org_id: string;
    parents: readonly FernNavigation.NavigationNodeParent[];
    node: FernNavigation.NavigationNodeWithMetadata;
    roleIndexes: Map<string, number>;
    authed: boolean;
}

export function createBaseRecord({
    domain,
    org_id,
    parents,
    node,
    roleIndexes,
    authed: isDocsSiteAuthed,
}: CreateBaseRecordOptions): BaseRecord {
    const productNode = parents.find((n): n is FernNavigation.ProductNode => n.type === "product");
    const versionNode = parents.find((n): n is FernNavigation.VersionNode => n.type === "version");
    const tabNode = parents.find((n): n is FernNavigation.TabNode => n.type === "tab");
    const sidebarRootIdx = parents.findIndex((n): n is FernNavigation.SidebarRootNode => n.type === "sidebarRoot");

    const breadcrumb =
        sidebarRootIdx <= 0
            ? []
            : parents
                  // we don't want to include the product, version, or tab in the breadcrumb
                  .slice(sidebarRootIdx + 1)
                  .filter(
                      (
                          n,
                      ): n is Extract<FernNavigation.NavigationNodeWithMetadata, FernNavigation.NavigationNodeParent> =>
                          FernNavigation.hasMetadata(n),
                  )
                  // Changelog months and years should not be included in the breadcrumb
                  .filter((n) => n.type !== "changelogMonth" && n.type !== "changelogYear")
                  .map((metadata) => ({
                      title: metadata.title,
                      pathname: addLeadingSlash(metadata.canonicalSlug ?? metadata.slug),
                  }));

    const { roles, authed } = createViewersForNodes([...parents, node], isDocsSiteAuthed, roleIndexes);

    return {
        objectID: `${org_id}:${domain}:${node.id}`,
        org_id,
        domain,
        pathname: addLeadingSlash(node.canonicalSlug ?? node.slug),
        icon: node.icon,
        title: node.title,
        breadcrumb,
        product: productNode
            ? {
                  id: productNode.productId,
                  title: productNode.title,
                  pathname: `/${productNode.canonicalSlug ?? productNode.slug}`,
              }
            : undefined,
        version: versionNode
            ? {
                  id: versionNode.versionId,
                  title: versionNode.title,
                  pathname: `/${versionNode.canonicalSlug ?? versionNode.slug}`,
              }
            : undefined,
        tab: tabNode
            ? {
                  title: tabNode.title,
                  pathname: `/${tabNode.canonicalSlug ?? tabNode.slug}`,
              }
            : undefined,
        visible_by: roles.map((role) => createRoleFacet(role, roleIndexes)),
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
    roleIndexes: Map<string, number>,
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

    const requiredRoles = flipAndOrToOrAnd(viewersHierarchy, roleIndexes);

    return modifyRolesForEveryone(requiredRoles, authed);
}
