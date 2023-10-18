import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";

export function isVersionedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig,
): navigationConfig is FernRegistryDocsRead.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig,
): navigationConfig is FernRegistryDocsRead.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig,
): navigationConfig is FernRegistryDocsRead.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig,
): navigationConfig is FernRegistryDocsRead.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsRead.UnversionedUntabbedNavigationConfig).items);
}
