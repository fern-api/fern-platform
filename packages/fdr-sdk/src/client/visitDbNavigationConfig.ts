import { DocsV1Db } from ".";

export interface DbNavigationConfigVisitor<T> {
  versioned: (config: DocsV1Db.VersionedNavigationConfig) => T;
  unversioned: (config: DocsV1Db.UnversionedNavigationConfig) => T;
}

export interface DbUnversionedNavigationConfigVisitor<T> {
  tabbed: (config: DocsV1Db.UnversionedTabbedNavigationConfig) => T;
  untabbed: (config: DocsV1Db.UnversionedUntabbedNavigationConfig) => T;
}

export function visitDbNavigationConfig<T>(
  config: DocsV1Db.NavigationConfig,
  visitor: DbNavigationConfigVisitor<T>
): T {
  if (isVersionedNavigationConfig(config)) {
    return visitor.versioned(config);
  } else {
    return visitor.unversioned(config);
  }
}

export function visitUnversionedDbNavigationConfig<T>(
  config: DocsV1Db.UnversionedNavigationConfig,
  visitor: DbUnversionedNavigationConfigVisitor<T>
): T {
  if (isTabbedNavigationConfig(config)) {
    return visitor.tabbed(config);
  } else {
    return visitor.untabbed(config);
  }
}

function isVersionedNavigationConfig(
  config: DocsV1Db.NavigationConfig
): config is DocsV1Db.VersionedNavigationConfig {
  return Array.isArray((config as DocsV1Db.VersionedNavigationConfig).versions);
}

export function isTabbedNavigationConfig(
  config: DocsV1Db.UnversionedNavigationConfig
): config is DocsV1Db.UnversionedTabbedNavigationConfig {
  return (
    Array.isArray(
      (config as DocsV1Db.UnversionedTabbedNavigationConfig).tabs
    ) ||
    Array.isArray((config as DocsV1Db.UnversionedTabbedNavigationConfig).tabsV2)
  );
}
