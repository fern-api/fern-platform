import { DocsV1Read } from "@fern-api/fdr-sdk";

export function isVersionedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig,
): navigationConfig is DocsV1Read.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig,
): navigationConfig is DocsV1Read.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig,
): navigationConfig is DocsV1Read.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig,
): navigationConfig is DocsV1Read.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.UnversionedUntabbedNavigationConfig).items);
}

export function assertIsVersionedNavigationConfig(
    config: DocsV1Read.NavigationConfig,
): asserts config is DocsV1Read.VersionedNavigationConfig {
    if (!isVersionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected versioned.");
    }
}

export function assertIsUnversionedNavigationConfig(
    config: DocsV1Read.NavigationConfig,
): asserts config is DocsV1Read.UnversionedNavigationConfig {
    if (!isUnversionedNavigationConfig(config)) {
        throw new Error("Invalid navigation config. Expected unversioned.");
    }
}

export function getVersionAvailabilityLabel(availability: DocsV1Read.VersionAvailability): string {
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
