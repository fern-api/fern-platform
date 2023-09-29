import type { APIV1Db } from "../../../api";

export function getSubpackageParentSlugs(
    subpackage: APIV1Db.DbApiDefinitionSubpackage,
    definition: APIV1Db.DbApiDefinition
): string[] {
    return _getSubpackageParentSlugs(subpackage, definition, []);
}

function _getSubpackageParentSlugs(
    subpackage: APIV1Db.DbApiDefinitionSubpackage,
    definition: APIV1Db.DbApiDefinition,
    slugsSoFar: string[]
): string[] {
    const parent = subpackage.parent != null ? definition.subpackages[subpackage.parent] : undefined;
    if (parent != null) {
        slugsSoFar.push(parent.urlSlug);
        const grandparent = parent.parent != null ? definition.subpackages[parent.parent] : undefined;
        if (grandparent != null) {
            slugsSoFar.push(grandparent.urlSlug);
            return _getSubpackageParentSlugs(grandparent, definition, slugsSoFar);
        }
    }
    return slugsSoFar.reverse();
}
