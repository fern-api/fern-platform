import { DocsV1Read } from "../../../api";

export function isVersionedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig
): navigationConfig is DocsV1Read.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig
): navigationConfig is DocsV1Read.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig
): navigationConfig is DocsV1Read.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: DocsV1Read.NavigationConfig
): navigationConfig is DocsV1Read.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Read.UnversionedUntabbedNavigationConfig).items);
}
