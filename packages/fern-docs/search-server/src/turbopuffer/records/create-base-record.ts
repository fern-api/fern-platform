import { FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-api/ui-core-utils";
import { addLeadingSlash } from "@fern-docs/utils";
import { createRoleFacet } from "../../shared/roles/create-role-facet";
import {
  flipAndOrToOrAnd,
  modifyRolesForEveryone,
} from "../../shared/roles/role-utils";
import { FernTurbopufferRecordWithoutVector } from "../types";

interface CreateBaseRecordOptions {
  domain: string;
  org_id: string;
  parents: readonly FernNavigation.NavigationNodeParent[];
  node: FernNavigation.NavigationNodeWithMetadata;
  authed: boolean;
  type: "markdown" | "api-reference";
}

export type BaseRecord = Omit<
  FernTurbopufferRecordWithoutVector,
  "attributes"
> & {
  attributes: Omit<FernTurbopufferRecordWithoutVector["attributes"], "chunk">;
};

export function createBaseRecord({
  domain,
  org_id,
  parents,
  node,
  authed: isDocsSiteAuthed,
  type,
}: CreateBaseRecordOptions): BaseRecord {
  const productNode = parents.find(
    (n): n is FernNavigation.ProductNode => n.type === "product"
  );
  const versionNode = parents.find(
    (n): n is FernNavigation.VersionNode => n.type === "version"
  );
  const tabNode = parents.find(
    (n): n is FernNavigation.TabNode => n.type === "tab"
  );
  const sidebarRootIdx = parents.findIndex(
    (n): n is FernNavigation.SidebarRootNode => n.type === "sidebarRoot"
  );

  const breadcrumb =
    sidebarRootIdx <= 0
      ? []
      : parents
          // we don't want to include the product, version, or tab in the breadcrumb
          .slice(sidebarRootIdx + 1)
          .filter(
            (
              n
            ): n is Extract<
              FernNavigation.NavigationNodeWithMetadata,
              FernNavigation.NavigationNodeParent
            > => FernNavigation.hasMetadata(n)
          )
          // Changelog months and years should not be included in the breadcrumb
          .filter(
            (n) => n.type !== "changelogMonth" && n.type !== "changelogYear"
          )
          .map((metadata) => metadata.title);

  const { roles, authed } = createViewersForNodes(
    [...parents, node],
    isDocsSiteAuthed
  );

  return {
    id: `${org_id}:${domain}:${node.id}`,
    attributes: {
      type,
      org_id,
      domain,
      canonicalPathname: addLeadingSlash(node.canonicalSlug ?? node.slug),
      pathname: addLeadingSlash(node.slug),
      icon: node.icon,
      title: node.title,
      breadcrumb,
      product: productNode?.title,
      version: versionNode?.title,
      tab: tabNode?.title,
      visible_by: roles.map(createRoleFacet),
      authed,
      page_position: 0,
    },
  };
}

/**
 * @param nodes - the parents and the node itself
 * @param authed - whether the docs site has auth enabled. If false, we assume the default case that all records should be visible to everyone.
 * @returns a OR list of AND'd roles, or [[EVERYONE_ROLE]] if the list is empty AND the docs site does not have auth enabled.
 */
function createViewersForNodes(
  nodes: readonly FernNavigation.NavigationNode[],
  authed: boolean
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
