import { DocsV1Db } from "../../../api";

export function isVersionedNavigationConfig(
    navigationConfig: DocsV1Db.NavigationConfig
): navigationConfig is DocsV1Db.VersionedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Db.VersionedNavigationConfig).versions);
}

export function isUnversionedNavigationConfig(
    navigationConfig: DocsV1Db.NavigationConfig
): navigationConfig is DocsV1Db.UnversionedNavigationConfig {
    return (
        isUnversionedTabbedNavigationConfig(navigationConfig) || isUnversionedUntabbedNavigationConfig(navigationConfig)
    );
}

export function isUnversionedTabbedNavigationConfig(
    navigationConfig: DocsV1Db.NavigationConfig
): navigationConfig is DocsV1Db.UnversionedTabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Db.UnversionedTabbedNavigationConfig).tabs);
}

export function isUnversionedUntabbedNavigationConfig(
    navigationConfig: DocsV1Db.NavigationConfig
): navigationConfig is DocsV1Db.UnversionedUntabbedNavigationConfig {
    return Array.isArray((navigationConfig as DocsV1Db.UnversionedUntabbedNavigationConfig).items);
}
