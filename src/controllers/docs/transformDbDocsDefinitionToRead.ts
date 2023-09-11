import type * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
import { type WithoutQuestionMarks } from "../../util";
import {
    isUnversionedNavigationConfig as isUnversionedDbConfig,
    isUnversionedUntabbedNavigationConfig as isUnversionedUntabbedDbConfig,
    isVersionedNavigationConfig as isVersionedDbConfig,
} from "../../util/fern/db";

export function transformDbDocsDefinitionToRead({
    dbShape,
}: {
    dbShape: FernRegistryDocsDb.DocsDefinitionDb;
}): WithoutQuestionMarks<FernRegistryDocsRead.DocsConfig> {
    return {
        navigation: transformNavigationConfigToRead(dbShape.config.navigation),
        logo: dbShape.config.logo,
        logoV2: dbShape.config.logoV2,
        logoHeight: dbShape.config.logoHeight,
        logoHref: dbShape.config.logoHref,
        colors: dbShape.config.colors,
        colorsV2: dbShape.config.colorsV2,
        navbarLinks: dbShape.config.navbarLinks ?? [],
        title: dbShape.config.title,
        favicon: dbShape.config.favicon,
        backgroundImage: dbShape.config.backgroundImage,
        typography: dbShape.config.typography,
    };
}

export function transformNavigationConfigToRead(
    dbShape: FernRegistryDocsDb.NavigationConfig
): FernRegistryDocsRead.NavigationConfig {
    if (isUnversionedDbConfig(dbShape)) {
        return transformUnversionedNavigationConfigForDb(dbShape);
    } else if (isVersionedDbConfig(dbShape)) {
        return transformVersionedNavigationConfigForDb(dbShape);
    }
    throw new Error("navigationConfig is neither unversioned nor versioned");
}

function transformVersionedNavigationConfigForDb(
    config: FernRegistryDocsDb.VersionedNavigationConfig
): FernRegistryDocsRead.VersionedNavigationConfig {
    return {
        versions: config.versions.map((version) => ({
            version: version.version,
            config: transformUnversionedNavigationConfigForDb(version.config),
        })),
    };
}

function transformUnversionedNavigationConfigForDb(
    config: FernRegistryDocsDb.UnversionedNavigationConfig
): FernRegistryDocsRead.UnversionedNavigationConfig {
    return isUnversionedUntabbedDbConfig(config)
        ? {
              items: config.items.map(transformNavigationItemForDb),
          }
        : {
              tabs: config.tabs.map(transformNavigationTabForDb),
          };
}

export function transformNavigationTabForDb(
    dbShape: FernRegistryDocsDb.NavigationTab
): FernRegistryDocsRead.NavigationTab {
    return {
        ...dbShape,
        items: dbShape.items.map(transformNavigationItemForDb),
    };
}

export function transformNavigationItemForDb(
    dbShape: FernRegistryDocsDb.NavigationItem
): FernRegistryDocsRead.NavigationItem {
    switch (dbShape.type) {
        case "api":
            return {
                ...dbShape,
                showErrors: dbShape.showErrors ?? false,
            };
        case "page":
            return dbShape;
        case "section":
            return {
                ...dbShape,
                items: dbShape.items.map((item) => transformNavigationItemForDb(item)),
            };
    }
}
