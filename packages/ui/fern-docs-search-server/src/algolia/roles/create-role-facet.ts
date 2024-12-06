/**
 * Create a facet for the given roles.
 *
 * This is used to create the `visible_by` facet in the Algolia record.
 *
 * everyone -> role/everyone
 * a -> role/a
 * [a, b] -> role/a/b
 */
export function createRoleFacet(roles: string[]): string {
    return `role/${roles
        .sort()
        // ensure that the role is encoded such that it can be used in a filter safely
        .map((role) => encodeURIComponent(role))
        .join("/")}`;
}
