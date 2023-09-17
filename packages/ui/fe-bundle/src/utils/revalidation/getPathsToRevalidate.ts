import {
    DocsDefinition,
    NavigationConfig,
} from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedUntabbedNavigationConfig, isVersionedNavigationConfig } from "@fern-ui/app-utils";
import { getPathsForUnversionedTabbedDocs } from "./getPathsForTabbedDocs";
import { getPathsForUnversionedUntabbedDocs } from "./getPathsForUnversionedUntabbedDocs";
import { getPathsToRevalidateForVersionedDocs } from "./getPathsForVersionedDocs";

export function getPathsToRevalidate({
    navigationConfig,
    docsDefinition,
}: {
    navigationConfig: NavigationConfig;
    docsDefinition: DocsDefinition;
}): string[] {
    if (isVersionedNavigationConfig(navigationConfig)) {
        return Array.from(
            getPathsToRevalidateForVersionedDocs({
                navigationConfig,
                docsDefinition,
            })
        );
    } else if (isUnversionedUntabbedNavigationConfig(navigationConfig)) {
        return Array.from(
            getPathsForUnversionedUntabbedDocs({
                navigationConfig,
                docsDefinition,
                prefix: undefined,
            })
        );
    } else {
        // unversioned tabbed
        return Array.from(
            getPathsForUnversionedTabbedDocs({
                navigationConfig,
                docsDefinition,
                prefix: undefined,
            })
        );
    }
}
