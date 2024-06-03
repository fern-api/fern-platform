import { DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";

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

export function getVersionAvailabilityLabel(availability: FernNavigation.Availability): string {
    switch (availability) {
        case FernNavigation.Availability.Beta:
            return "beta";
        case FernNavigation.Availability.Deprecated:
            return "deprecated";
        case FernNavigation.Availability.GenerallyAvailable:
            return "generally available";
        case FernNavigation.Availability.Stable:
            return "stable";
        case FernNavigation.Availability.InDevelopment:
            return "in development";
        case FernNavigation.Availability.PreRelease:
            return "pre-release";
        default:
            return "unknown";
    }
}
