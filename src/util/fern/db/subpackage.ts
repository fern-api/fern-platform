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

// Needs to have index signature
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PathPart = {
    name: string;
    urlSlug: string;
    skipUrlSlug?: boolean;
};

export function getSubpackageParentPathParts(
    subpackage: APIV1Db.DbApiDefinitionSubpackage,
    definition: APIV1Db.DbApiDefinition
): PathPart[] {
    return _getSubpackageParentPathParts(subpackage, definition, []);
}

function _getSubpackageParentPathParts(
    subpackage: APIV1Db.DbApiDefinitionSubpackage,
    definition: APIV1Db.DbApiDefinition,
    pathPartsSoFar: PathPart[]
): PathPart[] {
    const parent = subpackage.parent != null ? definition.subpackages[subpackage.parent] : undefined;
    if (parent != null) {
        pathPartsSoFar.push({ name: parent.name, urlSlug: parent.urlSlug });
        const grandparent = parent.parent != null ? definition.subpackages[parent.parent] : undefined;
        if (grandparent != null) {
            pathPartsSoFar.push({ name: grandparent.name, urlSlug: grandparent.urlSlug });
            return _getSubpackageParentPathParts(grandparent, definition, pathPartsSoFar);
        }
    }
    return pathPartsSoFar.reverse();
}
