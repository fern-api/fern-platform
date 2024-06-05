import { DocsV1Read } from "..";

export interface ReadNavigationConfigVisitor {
    versioned: (config: DocsV1Read.VersionedNavigationConfig) => void;
    unversioned: (config: DocsV1Read.UnversionedNavigationConfig) => void;
}

export interface ReadUnversionedNavigationConfigVisitor {
    tabbed: (config: DocsV1Read.UnversionedTabbedNavigationConfig) => void;
    untabbed: (config: DocsV1Read.UnversionedUntabbedNavigationConfig) => void;
}

export function visitReadNavigationConfig(
    config: DocsV1Read.NavigationConfig,
    visitor: ReadNavigationConfigVisitor,
): void {
    if (isVersionedNavigationConfig(config)) {
        visitor.versioned(config);
    } else {
        visitor.unversioned(config);
    }
}

export function visitUnversionedReadNavigationConfig(
    config: DocsV1Read.UnversionedNavigationConfig,
    visitor: ReadUnversionedNavigationConfigVisitor,
): void {
    if (isTabbedNavigationConfig(config)) {
        visitor.tabbed(config);
    } else {
        visitor.untabbed(config);
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
