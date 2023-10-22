import type * as FernRegistryDocsRead from "@fern-api/fdr-sdk/dist/generated/api/resources/docs/resources/v1/resources/read";

export function isVersionedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.UnversionedUntabbedNavigationConfig).items);
}

export function assertIsVersionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): asserts config is FernRegistryDocsRead.VersionedNavigationConfig {
    if (!isVersionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected versioned.");
    }
}

export function assertIsUnversionedNavigationConfig(
    config: FernRegistryDocsRead.NavigationConfig
): asserts config is FernRegistryDocsRead.UnversionedNavigationConfig {
    if (!isUnversionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected unversioned.");
    }
}

export function getVersionAvailabilityLabel(availability: FernRegistryDocsRead.VersionAvailability): string {
    switch (availability) {
        case "Beta":
            return "beta";
        case "Deprecated":
            return "deprecated";
        case "GenerallyAvailable":
            return "generally available";
        case "Stable":
            return "stable";
        default:
            return "unknown";
    }
}
