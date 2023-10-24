import type * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { startCase } from "lodash-es";
import { joinUrlSlugs } from "../slug";

export function doesSubpackageHaveEndpointsOrWebhooksRecursive(
    subpackageId: FernRegistryApiRead.SubpackageId,
    resolveSubpackage: (subpackageId: FernRegistryApiRead.SubpackageId) => FernRegistryApiRead.ApiDefinitionSubpackage
): boolean {
    const subpackage = resolveSubpackage(subpackageId);
    if (subpackage.endpoints.length > 0 || subpackage.webhooks.length > 0) {
        return true;
    }
    return subpackage.subpackages.some((s) => doesSubpackageHaveEndpointsOrWebhooksRecursive(s, resolveSubpackage));
}

const SPLIT_VERSION_REGEX = / V (\d+)$/;

export function getSubpackageTitle(subpackage: FernRegistryApiRead.ApiDefinitionSubpackage): string {
    let s = startCase(subpackage.name);

    const splitVersionMatch = s.match(SPLIT_VERSION_REGEX);

    if (splitVersionMatch?.[1] != null && splitVersionMatch.index != null) {
        const version = splitVersionMatch[1];
        s = s.slice(0, splitVersionMatch.index) + ` V${version}`;
    }

    return s;
}

export function getSlugForFirstNavigatableEndpointOrWebhook(
    subpackage: FernRegistryApiRead.ApiDefinitionSubpackage,
    slugs: string[],
    apiDefinition: FernRegistryApiRead.ApiDefinition
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
                apiDefinition
            );
            if (slug != null) {
                return slug;
            }
        }
    }
    return undefined;
}
