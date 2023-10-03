import { FernRegistry } from "@fern-fern/registry-browser";
import { VersionedNavigationConfig } from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { isUnversionedUntabbedNavigationConfig } from "@fern-ui/app-utils";
import { getPathsForUnversionedTabbedDocs } from "./getPathsForTabbedDocs";
import { getPathsForUnversionedUntabbedDocs } from "./getPathsForUnversionedUntabbedDocs";

export function getPathsToRevalidateForVersionedDocs({
    navigationConfig,
    apis,
}: {
    navigationConfig: VersionedNavigationConfig;
    apis: Record<FernRegistry.ApiDefinitionId, FernRegistry.api.v1.read.ApiDefinition>;
}): Set<string> {
    const pathsToRevalidate: Set<string> = new Set<string>();
    navigationConfig.versions.forEach((version, idx) => {
        pathsToRevalidate.add(`/${version.urlSlug}`);
        if (isUnversionedUntabbedNavigationConfig(version.config)) {
            if (idx === 0) {
                getPathsForUnversionedUntabbedDocs({
                    prefix: undefined,
                    navigationConfig: version.config,
                    apis,
                }).forEach((val) => {
                    pathsToRevalidate.add(val);
                });
            }
            getPathsForUnversionedUntabbedDocs({
                prefix: `/${version.urlSlug}`,
                navigationConfig: version.config,
                apis,
            }).forEach((val) => {
                pathsToRevalidate.add(val);
            });
        } else {
            if (idx === 0) {
                getPathsForUnversionedTabbedDocs({
                    prefix: undefined,
                    navigationConfig: version.config,
                    apis,
                }).forEach((val) => {
                    pathsToRevalidate.add(val);
                });
            }
            getPathsForUnversionedTabbedDocs({
                prefix: `/${version.urlSlug}`,
                navigationConfig: version.config,
                apis,
            }).forEach((val) => {
                pathsToRevalidate.add(val);
            });
        }
    });
    return pathsToRevalidate;
}
