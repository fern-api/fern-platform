import { FernRegistry } from "@fern-fern/registry-browser";
import { UnversionedUntabbedNavigationConfig } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { UrlSlugTree } from "@fern-ui/app-utils";

export function getPathsForUnversionedUntabbedDocs({
    prefix,
    navigationConfig,
    apis,
}: {
    prefix: string | undefined;
    navigationConfig: UnversionedUntabbedNavigationConfig;
    apis: Record<FernRegistry.ApiDefinitionId, FernRegistry.api.v1.read.ApiDefinition>;
}): Set<string> {
    const urlSlugTree = new UrlSlugTree({
        items: navigationConfig.items,
        loadApiDefinition: (id) => apis[id],
    });
    return new Set<string>([
        ...urlSlugTree.getAllSlugs().map((slug) => {
            if (prefix != null) {
                return `${prefix}/${slug}`;
            }
            return `/${slug}`;
        }),
    ]);
}
