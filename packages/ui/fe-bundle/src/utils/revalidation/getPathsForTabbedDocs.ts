import { FernRegistry } from "@fern-fern/registry-browser";
import { UnversionedTabbedNavigationConfig } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { getPathsForUnversionedUntabbedDocs } from "./getPathsForUnversionedUntabbedDocs";

export function getPathsForUnversionedTabbedDocs({
    prefix,
    navigationConfig,
    apis,
}: {
    prefix: string | undefined;
    navigationConfig: UnversionedTabbedNavigationConfig;
    apis: Record<FernRegistry.ApiDefinitionId, FernRegistry.api.v1.read.ApiDefinition>;
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
            apis,
        }).forEach((val) => {
            pathsToRevalidate.add(val);
        });
    });
    return pathsToRevalidate;
}
