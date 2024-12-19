import { EVERYONE_ROLE } from "@fern-docs/utils";
import { createRoleFacet } from "../shared/roles/create-role-facet";
import { createPermutations } from "../shared/roles/role-utils";

interface CreateSearchFiltersOpts {
  domain: string;

  /**
   * roles are ignored if the user is unauthed
   * but if they are authed, we automatically include the "everyone" role, and then generate all permutations of the provided roles
   * "everyone" does not have to be included explicitly in the permutations.
   */
  roles: string[];

  /**
   * If false, filters out any content that is only visible to unauthed users
   */
  authed: boolean;
}

const VISIBLE_BY_FACET = "visible_by";
const AUTHED_FACET = "authed";

export function createSearchFilters({
  domain,
  roles,
  authed,
}: CreateSearchFiltersOpts): string {
  if (!authed) {
    // if the user is unauthed, we only want to show content where authed=false
    return `domain:${domain} AND ${AUTHED_FACET}:false`;
  }

  // if the user is authed, we can show both content where authed=false AND authed=true
  // In algolia, you cannot create a OR statements across multiple facets, so we must include the "everyone" role in all the filter combinations
  // for example, all records that do not require auth must include the visible_by:role/everyone facet.
  // therefore, all filter combinations must include visible_by:role/everyone as well as any additional role filters.
  const roleFilters = [
    `${VISIBLE_BY_FACET}:${createRoleFacet([EVERYONE_ROLE])}`,
    ...createPermutations(roles.filter((r) => r !== EVERYONE_ROLE)).map(
      (perms) => `${VISIBLE_BY_FACET}:${createRoleFacet(perms)}`
    ),
  ];

  return `domain:${domain} AND (${roleFilters.join(" OR ")})`;
}
