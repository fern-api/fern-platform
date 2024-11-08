import { EVERYONE_ROLE } from "@fern-ui/fern-docs-utils";

/**
 * Create a facet for the given roles.
 *
 * This is used to create the `visible_by` facet in the Algolia record.
 *
 * everyone -> role/everyone
 * a -> role/a
 * [a, b] -> role/a/b
 */
export function createRoleFacet(roles: string[], roleIndexes: Map<string, number>): string {
    // return `role/${roles
    // .sort()
    // // ensure that the role is encoded such that it can be used in a filter safely
    // .map((role) => encodeURIComponent(role))
    // .join("/")}`;
    if (roles[0] === EVERYONE_ROLE) {
        return "0";
    }
    return `${roles.reduce((acc, role) => {
        const roleIdx = roleIndexes.get(role);
        if (roleIdx != null) {
            return acc | (1 << roleIdx);
        }
        return acc;
    }, 0)}`;
}
