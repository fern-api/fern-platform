import type { FernRegistry } from "../generated";

export function getSubpackageParentSlugs(
    subpackage: FernRegistry.api.v1.db.DbApiDefinitionSubpackage,
    definition: FernRegistry.api.v1.db.DbApiDefinition
): string[] {
    return _getSubpackageParentSlugs(subpackage, definition, []);
}

function _getSubpackageParentSlugs(
    subpackage: FernRegistry.api.v1.db.DbApiDefinitionSubpackage,
    definition: FernRegistry.api.v1.db.DbApiDefinition,
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
