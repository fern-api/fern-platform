import { kebabCase } from "lodash";
import type * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import type * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
import { type WithoutQuestionMarks } from "../../util";
import { DEFAULT_DARK_MODE_ACCENT_PRIMARY, DEFAULT_LIGHT_MODE_ACCENT_PRIMARY } from "../../util/colors";
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
        colorsV3: dbShape.config.colorsV3 ?? getColorsV3(dbShape.config),
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
        return transformVersionedNavigationConfigToRead(dbShape);
    }
    throw new Error("navigationConfig is neither unversioned nor versioned");
}

function transformVersionedNavigationConfigToRead(
    config: FernRegistryDocsDb.VersionedNavigationConfig
): WithoutQuestionMarks<FernRegistryDocsRead.VersionedNavigationConfig> {
    return {
        versions: config.versions.map(
            (version): WithoutQuestionMarks<FernRegistryDocsRead.VersionedNavigationConfigData> => ({
                urlSlug: version.urlSlug ?? kebabCase(version.version),
                availability: version.availability,
                version: version.version,
                config: transformUnversionedNavigationConfigForDb(version.config),
            })
        ),
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

export function getColorsV3(docsDbConfig: FernRegistryDocsDb.DocsDbConfig): FernRegistryDocsRead.ColorsConfigV3 {
    if (docsDbConfig.colorsV2 != null) {
        if (docsDbConfig.colorsV2.accentPrimary?.type === "themed") {
            if (docsDbConfig.colorsV2.background == null) {
                if (
                    docsDbConfig.colorsV2.accentPrimary.dark != null &&
                    docsDbConfig.colorsV2.accentPrimary.light == null
                ) {
                    return {
                        type: "dark",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.dark,
                        background: { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else if (
                    docsDbConfig.colorsV2.accentPrimary.light != null &&
                    docsDbConfig.colorsV2.accentPrimary.dark == null
                ) {
                    return {
                        type: "light",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.light,
                        background: { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else {
                    return {
                        type: "darkAndLight",
                        dark: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.dark ??
                                docsDbConfig.colors?.accentPrimary ??
                                DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                            background: { type: "gradient" },
                            logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                        },
                        light: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.light ?? DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                            background: { type: "gradient" },
                            logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                        },
                    };
                }
            } else if (docsDbConfig.colorsV2.background.type == "unthemed") {
                if (
                    docsDbConfig.colorsV2.accentPrimary.dark != null &&
                    docsDbConfig.colorsV2.accentPrimary.light == null
                ) {
                    return {
                        type: "dark",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.dark,
                        background:
                            docsDbConfig.colorsV2.background.color != null
                                ? { type: "solid", ...docsDbConfig.colorsV2.background.color }
                                : { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else if (
                    docsDbConfig.colorsV2.accentPrimary.light != null &&
                    docsDbConfig.colorsV2.accentPrimary.dark == null
                ) {
                    return {
                        type: "light",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.light,
                        background: { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else {
                    return {
                        type: "darkAndLight",
                        dark: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.dark ??
                                docsDbConfig.colors?.accentPrimary ??
                                DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                            background:
                                docsDbConfig.colorsV2.background.color != null
                                    ? { type: "solid", ...docsDbConfig.colorsV2.background.color }
                                    : { type: "gradient" },
                            logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                        },
                        light: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.light ?? DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                            background: { type: "gradient" },
                            logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                        },
                    };
                }
            } else {
                if (
                    docsDbConfig.colorsV2.accentPrimary.dark != null &&
                    docsDbConfig.colorsV2.accentPrimary.light == null
                ) {
                    return {
                        type: "dark",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.dark,
                        background:
                            docsDbConfig.colorsV2.background.dark != null
                                ? { type: "solid", ...docsDbConfig.colorsV2.background.dark }
                                : { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else if (
                    docsDbConfig.colorsV2.accentPrimary.light != null &&
                    docsDbConfig.colorsV2.accentPrimary.dark == null
                ) {
                    return {
                        type: "light",
                        accentPrimary: docsDbConfig.colorsV2.accentPrimary.light,
                        background:
                            docsDbConfig.colorsV2.background.light != null
                                ? { type: "solid", ...docsDbConfig.colorsV2.background.light }
                                : { type: "gradient" },
                        logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                    };
                } else {
                    return {
                        type: "darkAndLight",
                        dark: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.dark ??
                                docsDbConfig.colors?.accentPrimary ??
                                DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                            background:
                                docsDbConfig.colorsV2.background.dark != null
                                    ? { type: "solid", ...docsDbConfig.colorsV2.background.dark }
                                    : { type: "gradient" },
                            logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                        },
                        light: {
                            accentPrimary:
                                docsDbConfig.colorsV2.accentPrimary.light ?? DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                            background:
                                docsDbConfig.colorsV2.background.light != null
                                    ? { type: "solid", ...docsDbConfig.colorsV2.background.light }
                                    : { type: "gradient" },
                            logo: docsDbConfig.logoV2?.light ?? docsDbConfig.logo,
                        },
                    };
                }
            }
        } else if (docsDbConfig.colorsV2.accentPrimary?.type === "unthemed") {
            if (docsDbConfig.colorsV2.background == null) {
                return {
                    type: "dark",
                    accentPrimary: docsDbConfig.colorsV2.accentPrimary.color ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                    background: { type: "gradient" },
                    logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                };
            } else if (docsDbConfig.colorsV2.background.type === "unthemed") {
                return {
                    type: "dark",
                    accentPrimary: docsDbConfig.colorsV2.accentPrimary.color ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                    background:
                        docsDbConfig.colorsV2.background.color != null
                            ? { type: "solid", ...docsDbConfig.colorsV2.background.color }
                            : { type: "gradient" },
                    logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                };
            } else {
                return {
                    // background is themed
                    type: "dark",
                    accentPrimary: docsDbConfig.colorsV2.accentPrimary.color ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                    background:
                        docsDbConfig.colorsV2.background.dark != null
                            ? { type: "solid", ...docsDbConfig.colorsV2.background.dark }
                            : { type: "gradient" },
                    logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
                };
            }
        }
    } else if (docsDbConfig.colors != null) {
        return {
            type: "dark",
            accentPrimary: docsDbConfig.colors.accentPrimary ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
            background: { type: "gradient" },
            logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
        };
    }
    return {
        type: "dark",
        accentPrimary: DEFAULT_DARK_MODE_ACCENT_PRIMARY,
        background: { type: "gradient" },
        logo: docsDbConfig.logoV2?.dark ?? docsDbConfig.logo,
    };
}

//
