import type * as FernRegistryDocDb from "../../../generated/api/resources/docs/resources/v1/resources/db";

export function isVersionedNavigationConfig(
    navigationConfig: FernRegistryDocDb.NavigationConfig
): navigationConfig is FernRegistryDocDb.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocDb.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: FernRegistryDocDb.NavigationConfig
): navigationConfig is FernRegistryDocDb.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: FernRegistryDocDb.NavigationConfig
): navigationConfig is FernRegistryDocDb.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocDb.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: FernRegistryDocDb.NavigationConfig
): navigationConfig is FernRegistryDocDb.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocDb.UnversionedUntabbedNavigationConfig).items);
}
