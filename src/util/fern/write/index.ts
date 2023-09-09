import type * as FernRegistryDocsWrite from "../../../generated/api/resources/docs/resources/v1/resources/write";

export function isVersionedNavigationConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsWrite.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsWrite.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as FernRegistryDocsWrite.UnversionedUntabbedNavigationConfig).items);
}
