import { APIV1Read } from "@fern-api/fdr-sdk";
import { joinUrlSlugs } from "./slug.js";

export function isSubpackage(package_: APIV1Read.ApiDefinitionPackage): package_ is APIV1Read.ApiDefinitionSubpackage {
    return typeof (package_ as APIV1Read.ApiDefinitionSubpackage).subpackageId === "string";
}

export function doesSubpackageHaveEndpointsOrWebhooksRecursive(
    subpackageId: APIV1Read.SubpackageId,
    resolveSubpackage: (subpackageId: APIV1Read.SubpackageId) => APIV1Read.ApiDefinitionSubpackage | undefined,
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage == null) {
        return false;
    }
    if (subpackage.endpoints.length > 0 || subpackage.webhooks.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => doesSubpackageHaveEndpointsOrWebhooksRecursive(s, resolveSubpackage));
}

const SPLIT_VERSION_REGEX = / V (\d+)$/;

// convert snake_case, kebab-case, camelCase, PascalCase, or sentence case, etc. to start case
function startCase(str: string): string {
    return str
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function getSubpackageTitle(subpackage: APIV1Read.ApiDefinitionSubpackage): string {
    let s = startCase(subpackage.name);

    const splitVersionMatch = s.match(SPLIT_VERSION_REGEX);

    if (splitVersionMatch?.[1] != null && splitVersionMatch.index != null) {
        const version = splitVersionMatch[1];
        s = s.slice(0, splitVersionMatch.index) + ` V${version}`;
    }

    return s;
}

export function getSlugForFirstNavigatableEndpointOrWebhook(
    subpackage: APIV1Read.ApiDefinitionSubpackage,
    slugs: string[],
    apiDefinition: APIV1Read.ApiDefinition,
): string | undefined {
    const firstNavigatable = subpackage.endpoints[0] ?? subpackage.webhooks[0];
    if (firstNavigatable != null) {
        return joinUrlSlugs(...(slugs as [string, ...string[]]), firstNavigatable.urlSlug);
    }
    for (const childSubpackageId of subpackage.subpackages) {
        const childSubpackage = apiDefinition.subpackages[childSubpackageId];
        if (childSubpackage != null) {
            const slug = getSlugForFirstNavigatableEndpointOrWebhook(
                childSubpackage,
                [...slugs, childSubpackage.urlSlug],
                apiDefinition,
            );
            if (slug != null) {
                return slug;
            }
        }
    }
    return undefined;
}
