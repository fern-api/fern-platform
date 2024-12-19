import { DocsV1Db, DocsV1Read, DocsV1Write } from ".";

export interface DbNavigationTabVisitor<T> {
    link: (config: DocsV1Read.NavigationTabLink) => T;
    group: (config: DocsV1Db.NavigationTabGroup) => T;
}

export function visitDbNavigationTab<T>(
    config: DocsV1Db.NavigationTab,
    visitor: DbNavigationTabVisitor<T>
): T {
    if (isNavigationTabLink(config)) {
        return visitor.link(config);
    } else {
        return visitor.group(config);
    }
}

export interface WriteNavigationTabVisitor<T> {
    link: (config: DocsV1Write.NavigationTabLink) => T;
    group: (config: DocsV1Write.NavigationTabGroup) => T;
}

export function visitWriteNavigationTab<T>(
    config: DocsV1Write.NavigationTab,
    visitor: WriteNavigationTabVisitor<T>
): T {
    if (isNavigationTabLink(config)) {
        return visitor.link(config);
    } else {
        return visitor.group(config);
    }
}

export function isNavigationTabLink(
    config: DocsV1Db.NavigationTab | DocsV1Write.NavigationTab
): config is DocsV1Write.NavigationTabLink {
    return "url" in config && typeof config.url === "string";
}
