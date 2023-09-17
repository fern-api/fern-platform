import {
    DocsDefinition,
    UnversionedTabbedNavigationConfig,
} from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getPathsForUnversionedUntabbedDocs } from "./getPathsForUnversionedUntabbedDocs";

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
        getPathsForUnversionedUntabbedDocs({
            prefix: `/${tab.urlSlug}`,
            navigationConfig: {
                items: tab.items,
            },
            docsDefinition,
        }).forEach((val) => {
            pathsToRevalidate.add(val);
        });
    });
    return pathsToRevalidate;
}
