import {
    DocsDefinition,
    UnversionedTabbedNavigationConfig,
} from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { UrlSlugTree } from "@fern-ui/app-utils";

export function getPathsForUnversionedTabbedDocs({
    prefix,
    navigationConfig,
    docsDefinition,
}: {
    prefix: string | undefined;
    navigationConfig: UnversionedTabbedNavigationConfig;
    docsDefinition: DocsDefinition;
}): Set<string> {
    const pathsToRevalidate = new Set<string>(["/"]);
    navigationConfig.tabs.forEach((tab) => {
        // revalidate the url to the path
        if (prefix == null) {
            pathsToRevalidate.add(`/${tab.urlSlug}`);
        } else {
            pathsToRevalidate.add(`${prefix}/${tab.urlSlug}`);
        }
        // revalidate all the content within the tab
        const urlSlugTree = new UrlSlugTree({
            items: tab.items,
            loadApiDefinition: (id) => docsDefinition.apis[id],
        });
        urlSlugTree
            .getAllSlugs()
            .map((slug) => {
                if (prefix != null) {
                    return `${prefix}/${tab.urlSlug}/${slug}`;
                }
                return `/${tab.urlSlug}/${slug}`;
            })
            .forEach((val) => {
                pathsToRevalidate.add(val);
            });
    });
    return pathsToRevalidate;
}
