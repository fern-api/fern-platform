import { DocsV1Write } from ".";

export interface WriteNavigationConfigVisitor<T> {
    versioned: (config: DocsV1Write.VersionedNavigationConfig) => T;
    unversioned: (config: DocsV1Write.UnversionedNavigationConfig) => T;
}

export interface WriteUnversionedNavigationConfigVisitor<T> {
    tabbed: (config: DocsV1Write.UnversionedTabbedNavigationConfig) => T;
    untabbed: (config: DocsV1Write.UnversionedUntabbedNavigationConfig) => T;
}

export function visitWriteNavigationConfig<T>(
    config: DocsV1Write.NavigationConfig,
    visitor: WriteNavigationConfigVisitor<T>
): T {
    if (isVersionedNavigationConfig(config)) {
        return visitor.versioned(config);
    } else {
        return visitor.unversioned(config);
    }
}

export function visitUnversionedWriteNavigationConfig<T>(
    config: DocsV1Write.UnversionedNavigationConfig,
    visitor: WriteUnversionedNavigationConfigVisitor<T>
): T {
    if (isTabbedNavigationConfig(config)) {
        return visitor.tabbed(config);
    } else {
        return visitor.untabbed(config);
    }
}

function isVersionedNavigationConfig(
    config: DocsV1Write.NavigationConfig
): config is DocsV1Write.VersionedNavigationConfig {
    return Array.isArray(
        (config as DocsV1Write.VersionedNavigationConfig).versions
    );
}

export function isTabbedNavigationConfig(
    config: DocsV1Write.UnversionedNavigationConfig
): config is DocsV1Write.UnversionedTabbedNavigationConfig {
    return (
        Array.isArray(
            (config as DocsV1Write.UnversionedTabbedNavigationConfig).tabs
        ) ||
        Array.isArray(
            (config as DocsV1Write.UnversionedTabbedNavigationConfig).tabsV2
        )
    );
}
