import {
    DocsDefinition,
    UnversionedUntabbedNavigationConfig,
} from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { UrlSlugTree } from "@fern-ui/app-utils";

export function getPathsForUnversionedUntabbedDocs({
    prefix,
    navigationConfig,
    docsDefinition,
}: {
    prefix: string | undefined;
    navigationConfig: UnversionedUntabbedNavigationConfig;
    docsDefinition: DocsDefinition;
}): Set<string> {
    const urlSlugTree = new UrlSlugTree({
        items: navigationConfig.items,
        loadApiDefinition: (id) => docsDefinition.apis[id],
    });
    return new Set<string>([
        "/",
        ...urlSlugTree.getAllSlugs().map((slug) => {
            if (prefix != null) {
                return `${prefix}/${slug}`;
            }
            return `/${slug}`;
        }),
    ]);
}
