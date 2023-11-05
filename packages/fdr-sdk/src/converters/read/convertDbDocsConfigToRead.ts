import { kebabCase } from "lodash";
import { DocsV1Db, DocsV1Read, visitDbNavigationConfig, visitUnversionedDbNavigationConfig } from "../../client";
import { WithoutQuestionMarks } from "../utils/WithoutQuestionMarks";
import { DEFAULT_DARK_MODE_ACCENT_PRIMARY, DEFAULT_LIGHT_MODE_ACCENT_PRIMARY } from "../utils/colors";

export function convertDbDocsConfigToRead({
    dbShape,
}: {
    dbShape: DocsV1Db.DocsDbConfig;
}): WithoutQuestionMarks<DocsV1Read.DocsConfig> {
    return {
        navigation: transformNavigationConfigToRead(dbShape.navigation),
        logo: dbShape.logo,
        logoV2: dbShape.logoV2,
        logoHeight: dbShape.logoHeight,
        logoHref: dbShape.logoHref,
        colors: dbShape.colors,
        colorsV2: dbShape.colorsV2,
        colorsV3: dbShape.colorsV3 ?? getColorsV3(dbShape),
        navbarLinks: dbShape.navbarLinks ?? [],
        title: dbShape.title,
        favicon: dbShape.favicon,
        backgroundImage: dbShape.backgroundImage,
        typography: dbShape.typography,
    };
}

export function transformNavigationConfigToRead(dbShape: DocsV1Db.NavigationConfig): DocsV1Read.NavigationConfig {
    return visitDbNavigationConfig<DocsV1Read.NavigationConfig>(dbShape, {
        unversioned: (config) => {
            return transformUnversionedNavigationConfigForDb(config);
        },
        versioned: (config) => {
            return transformVersionedNavigationConfigToRead(config);
        },
    });
}

function transformVersionedNavigationConfigToRead(
    config: DocsV1Db.VersionedNavigationConfig,
): WithoutQuestionMarks<DocsV1Read.VersionedNavigationConfig> {
    return {
        versions: config.versions.map(
            (version): WithoutQuestionMarks<DocsV1Read.VersionedNavigationConfigData> => ({
                urlSlug: version.urlSlug ?? kebabCase(version.version),
                availability: version.availability,
                version: version.version,
                config: transformUnversionedNavigationConfigForDb(version.config),
            }),
        ),
    };
}

function transformUnversionedNavigationConfigForDb(
    config: DocsV1Db.UnversionedNavigationConfig,
): DocsV1Read.UnversionedNavigationConfig {
    return visitUnversionedDbNavigationConfig<DocsV1Read.UnversionedNavigationConfig>(config, {
        tabbed: (config) => {
            return {
                tabs: config.tabs.map(transformNavigationTabForDb),
            };
        },
        untabbed: (config) => {
            return {
                items: config.items.map(transformNavigationItemForDb),
            };
        },
    });
}

export function transformNavigationTabForDb(dbShape: DocsV1Db.NavigationTab): DocsV1Read.NavigationTab {
    return {
        ...dbShape,
        items: dbShape.items.map(transformNavigationItemForDb),
    };
}

export function transformNavigationItemForDb(dbShape: DocsV1Db.NavigationItem): DocsV1Read.NavigationItem {
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

export function getColorsV3(docsDbConfig: DocsV1Db.DocsDbConfig): DocsV1Read.ColorsConfigV3 {
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
