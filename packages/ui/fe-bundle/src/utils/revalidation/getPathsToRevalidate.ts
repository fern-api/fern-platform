import { FernRegistry } from "@fern-fern/registry-browser";
import { NavigationConfig } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedUntabbedNavigationConfig, isVersionedNavigationConfig } from "@fern-ui/app-utils";
import { getPathsForUnversionedTabbedDocs } from "./getPathsForTabbedDocs";
import { getPathsForUnversionedUntabbedDocs } from "./getPathsForUnversionedUntabbedDocs";
import { getPathsToRevalidateForVersionedDocs } from "./getPathsForVersionedDocs";

export function getPathsToRevalidate({
    navigationConfig,
    apis,
}: {
    navigationConfig: NavigationConfig;
    apis: Record<FernRegistry.ApiDefinitionId, FernRegistry.api.v1.read.ApiDefinition>;
}): string[] {
    if (isVersionedNavigationConfig(navigationConfig)) {
        return Array.from(
            getPathsToRevalidateForVersionedDocs({
                navigationConfig,
                apis,
            })
        );
    } else if (isUnversionedUntabbedNavigationConfig(navigationConfig)) {
        return Array.from(
            getPathsForUnversionedUntabbedDocs({
                navigationConfig,
                apis,
                prefix: undefined,
            })
        );
    } else {
        // unversioned tabbed
        return Array.from(
            getPathsForUnversionedTabbedDocs({
                navigationConfig,
                apis,
                prefix: undefined,
            })
        );
    }
}
