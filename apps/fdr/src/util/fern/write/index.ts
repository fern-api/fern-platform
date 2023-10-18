import { DocsV1Write } from "../../../api";

export function isVersionedNavigationConfig(
    navigationConfig: DocsV1Write.NavigationConfig,
): navigationConfig is DocsV1Write.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Write.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: DocsV1Write.NavigationConfig,
): navigationConfig is DocsV1Write.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: DocsV1Write.NavigationConfig,
): navigationConfig is DocsV1Write.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Write.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: DocsV1Write.NavigationConfig,
): navigationConfig is DocsV1Write.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Write.UnversionedUntabbedNavigationConfig).items);
}
