import { DocsV1Read } from "./types";

export interface ReadNavigationConfigVisitor<T> {
    versioned: (config: DocsV1Read.VersionedNavigationConfig) => T;
    unversioned: (config: DocsV1Read.UnversionedNavigationConfig) => T;
}

export interface ReadUnversionedNavigationConfigVisitor<T> {
    tabbed: (config: DocsV1Read.UnversionedTabbedNavigationConfig) => T;
    untabbed: (config: DocsV1Read.UnversionedUntabbedNavigationConfig) => T;
}

export function visitReadNavigationConfig<T>(
    config: DocsV1Read.NavigationConfig,
    visitor: ReadNavigationConfigVisitor<T>,
): T {
    if (isVersionedNavigationConfig(config)) {
        return visitor.versioned(config);
    } else {
        return visitor.unversioned(config);
    }
}

export function visitUnversionedReadNavigationConfig<T>(
    config: DocsV1Read.UnversionedNavigationConfig,
    visitor: ReadUnversionedNavigationConfigVisitor<T>,
): T {
    if (isTabbedNavigationConfig(config)) {
        return visitor.tabbed(config);
    } else {
        return visitor.untabbed(config);
    }
}

function isVersionedNavigationConfig(
    config: DocsV1Read.NavigationConfig,
): config is DocsV1Read.VersionedNavigationConfig {
    return Array.isArray((config as DocsV1Read.VersionedNavigationConfig).versions);
}

export function isTabbedNavigationConfig(
    config: DocsV1Read.UnversionedNavigationConfig,
): config is DocsV1Read.UnversionedTabbedNavigationConfig {
    return Array.isArray((config as DocsV1Read.UnversionedTabbedNavigationConfig).tabs);
}
