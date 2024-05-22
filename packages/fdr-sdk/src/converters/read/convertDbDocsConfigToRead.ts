import { kebabCase } from "lodash-es";
import tinycolor from "tinycolor2";
import {
    APIV1Read,
    DocsV1Db,
    DocsV1Read,
    visitDbNavigationConfig,
    visitUnversionedDbNavigationConfig,
} from "../../client";
import { visitDbNavigationTab } from "../../client/visitNavigationTab";
import { WithoutQuestionMarks } from "../utils/WithoutQuestionMarks";
import { DEFAULT_DARK_MODE_ACCENT_PRIMARY, DEFAULT_LIGHT_MODE_ACCENT_PRIMARY } from "../utils/colors";

export function convertDbDocsConfigToRead({
    dbShape,
    apis,
}: {
    dbShape: DocsV1Db.DocsDbConfig;
    apis: Record<string, APIV1Read.ApiDefinition>;
}): WithoutQuestionMarks<DocsV1Read.DocsConfig> {
    return {
        navigation: transformNavigationV1ConfigToRead(dbShape.navigation, apis),
        // logo: dbShape.logo,
        // logoV2: dbShape.logoV2,
        logoHeight: dbShape.logoHeight,
        logoHref: dbShape.logoHref,
        // colors: dbShape.colors,
        // colorsV2: dbShape.colorsV2,
        colorsV3: dbShape.colorsV3 ?? getColorsV3(dbShape),
        navbarLinks: dbShape.navbarLinks,
        footerLinks: dbShape.footerLinks,
        title: dbShape.title,
        favicon: dbShape.favicon,
        // backgroundImage: dbShape.backgroundImage,
        // typography: dbShape.typography ?? transformTypographyV2ToV1(dbShape.typographyV2),
        typographyV2: dbShape.typographyV2 ?? transformTypographyToV2(dbShape.typography),
        layout: dbShape.layout,
        css: dbShape.css,
        js: dbShape.js,
        metadata: dbShape.metadata,
        redirects: dbShape.redirects,
        integrations: dbShape.integrations,
    };
}

function transformFontConfigToV2(fontConfig: DocsV1Read.FontConfig | undefined): DocsV1Read.FontConfigV2 | undefined {
    if (fontConfig == null) {
        return undefined;
    }
    return {
        type: "custom",
        name: fontConfig.name,
        variants: [
            {
                fontFile: fontConfig.fontFile,
                weight: undefined,
                style: undefined,
            },
        ],
        display: undefined,
        fallback: undefined,
        fontVariationSettings: undefined,
    };
}

function transformTypographyToV2(
    typography: DocsV1Read.DocsTypographyConfig | undefined,
): DocsV1Read.DocsTypographyConfigV2 | undefined {
    if (typography == null) {
        return undefined;
    }
    return {
        headingsFont: transformFontConfigToV2(typography.headingsFont),
        bodyFont: transformFontConfigToV2(typography.bodyFont),
        codeFont: transformFontConfigToV2(typography.codeFont),
    };
}

function transformFontConfigV2ToV1(fontConfig: DocsV1Read.FontConfigV2 | undefined): DocsV1Read.FontConfig | undefined {
    if (fontConfig == null) {
        return undefined;
    }
    const firstVariant = fontConfig.variants[0];
    if (firstVariant == null) {
        return undefined;
    }
    return {
        name: fontConfig.name,
        fontFile: firstVariant.fontFile,
    };
}

function transformTypographyV2ToV1(
    typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
): DocsV1Read.DocsTypographyConfig | undefined {
    if (typography == null) {
        return undefined;
    }
    return {
        headingsFont: transformFontConfigV2ToV1(typography.headingsFont),
        bodyFont: transformFontConfigV2ToV1(typography.bodyFont),
        codeFont: transformFontConfigV2ToV1(typography.codeFont),
    };
}

export function transformNavigationV1ConfigToRead(
    dbShape: DocsV1Db.NavigationConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): DocsV1Read.NavigationConfig {
    return visitDbNavigationConfig<DocsV1Read.NavigationConfig>(dbShape, {
        unversioned: (config) => {
            return transformUnversionedNavigationConfigForDb(config, apis);
        },
        versioned: (config) => {
            return transformVersionedNavigationConfigToRead(config, apis);
        },
    });
}

function transformVersionedNavigationConfigToRead(
    config: DocsV1Db.VersionedNavigationConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): WithoutQuestionMarks<DocsV1Read.VersionedNavigationConfig> {
    return {
        versions: config.versions.map(
            (version): WithoutQuestionMarks<DocsV1Read.VersionedNavigationConfigData> => ({
                urlSlug: version.urlSlug ?? kebabCase(version.version),
                availability: version.availability,
                version: version.version,
                config: transformUnversionedNavigationConfigForDb(version.config, apis),
            }),
        ),
    };
}

function transformUnversionedNavigationConfigForDb(
    config: DocsV1Db.UnversionedNavigationConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): DocsV1Read.UnversionedNavigationConfig {
    return visitUnversionedDbNavigationConfig<DocsV1Read.UnversionedNavigationConfig>(config, {
        tabbed: (config) => {
            return {
                tabs: config.tabs.map((item) => transformNavigationTabForDb(item, apis)),
            };
        },
        untabbed: (config) => {
            return {
                items: config.items.map((item) => transformNavigationItemForDb(item, apis)),
            };
        },
    });
}

export function transformNavigationTabForDb(
    dbShape: DocsV1Db.NavigationTab,
    apis: Record<string, APIV1Read.ApiDefinition>,
): DocsV1Read.NavigationTab {
    return visitDbNavigationTab<DocsV1Read.NavigationTab>(dbShape, {
        link: (link) => ({ type: "link", ...link }),
        group: (group) => ({
            type: "group",
            ...group,
            items: group.items.map((item) => transformNavigationItemForDb(item, apis)),
        }),
    });
}

export function isNavigationTabLink(tab: DocsV1Db.NavigationTab): tab is DocsV1Read.NavigationTabLink {
    return (tab as DocsV1Read.NavigationTabLink).url != null;
}

export function transformNavigationItemForDb(
    dbShape: DocsV1Db.NavigationItem,
    apis: Record<string, APIV1Read.ApiDefinition>,
): DocsV1Read.NavigationItem {
    switch (dbShape.type) {
        case "api":
            return {
                ...dbShape,
                showErrors: dbShape.showErrors ?? false,
                navigationV2: dbShape.navigationV2 ?? migrateApiNavigationV1ToV2(dbShape.navigation, apis[dbShape.api]),
            };
        case "page":
        case "link":
            return dbShape;
        case "section":
            return {
                ...dbShape,
                items: dbShape.items.map((item) => transformNavigationItemForDb(item, apis)),
            };
    }
}

const EMPTY_DARK_THEME: DocsV1Read.ThemeConfig = {
    // required
    accentPrimary: DEFAULT_DARK_MODE_ACCENT_PRIMARY,
    background: { type: "gradient" },
    // optional
    logo: undefined,
    backgroundImage: undefined,
    border: undefined,
    sidebarBackground: undefined,
    headerBackground: undefined,
    cardBackground: undefined,
};

const EMPTY_LIGHT_THEME: DocsV1Read.ThemeConfig = {
    // required
    accentPrimary: DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
    background: { type: "gradient" },
    // optional
    logo: undefined,
    backgroundImage: undefined,
    border: undefined,
    sidebarBackground: undefined,
    headerBackground: undefined,
    cardBackground: undefined,
};

export function getColorsV3(docsDbConfig: DocsV1Db.DocsDbConfig): DocsV1Read.ColorsConfigV3 {
    let hasDarkMode = false;
    let hasLightMode = false;
    let darkTheme: Partial<DocsV1Read.ThemeConfig> = {};
    let lightTheme: Partial<DocsV1Read.ThemeConfig> = {};

    // copy over all colorV3 properties
    if (docsDbConfig.colorsV3 != null) {
        if (docsDbConfig.colorsV3.type === "dark") {
            hasDarkMode = true;
            const { type: _unused, ...dbDarkTheme } = docsDbConfig.colorsV3;
            darkTheme = { ...darkTheme, ...dbDarkTheme };
        } else if (docsDbConfig.colorsV3.type === "light") {
            hasLightMode = true;
            const { type: _unused, ...dbLightTheme } = docsDbConfig.colorsV3;
            lightTheme = { ...lightTheme, ...dbLightTheme };
        } else if (docsDbConfig.colorsV3.type === "darkAndLight") {
            hasDarkMode = true;
            hasLightMode = true;
            darkTheme = docsDbConfig.colorsV3.dark;
            lightTheme = docsDbConfig.colorsV3.light;
        }
    }

    // optionally copy over all colorV2 properties, if they haven't been set by colorV3
    if (docsDbConfig.colorsV2 != null) {
        if (docsDbConfig.colorsV2.background != null) {
            if (docsDbConfig.colorsV2.background.type === "themed") {
                if (docsDbConfig.colorsV2.background.dark != null && darkTheme.background == null) {
                    hasDarkMode = true;
                    darkTheme.background = { type: "solid", ...docsDbConfig.colorsV2.background.dark };
                }
                if (docsDbConfig.colorsV2.background.light != null && lightTheme.background == null) {
                    hasLightMode = true;
                    lightTheme.background = { type: "solid", ...docsDbConfig.colorsV2.background.light };
                }
            } else if (docsDbConfig.colorsV2.background.type === "unthemed") {
                if (docsDbConfig.colorsV2.background.color != null) {
                    // the background color is a good way to tell if we're in dark mode or light mode
                    // check the percieved brightness of the color:

                    if (tinycolor(docsDbConfig.colorsV2.background.color).isDark()) {
                        hasDarkMode = true;
                        darkTheme.background = { type: "solid", ...docsDbConfig.colorsV2.background.color };
                    } else {
                        hasLightMode = true;
                        lightTheme.background = { type: "solid", ...docsDbConfig.colorsV2.background.color };
                    }
                }
            }
        }

        if (docsDbConfig.colorsV2.accentPrimary?.type === "themed") {
            if (docsDbConfig.colorsV2.accentPrimary.dark != null && darkTheme.accentPrimary == null) {
                hasDarkMode = true;
                darkTheme.accentPrimary = docsDbConfig.colorsV2.accentPrimary.dark;
            }

            if (docsDbConfig.colorsV2.accentPrimary.light != null && lightTheme.accentPrimary == null) {
                hasLightMode = true;
                lightTheme.accentPrimary = docsDbConfig.colorsV2.accentPrimary.light;
            }
        } else if (docsDbConfig.colorsV2.accentPrimary?.type === "unthemed") {
            // we don't know at this point whether accentPrimary is dark or light, so we'll set both
            // but we don't mark hasDarkMode or hasLightMode as true, because we don't know which it is
            if (docsDbConfig.colorsV2.accentPrimary.color != null) {
                if (darkTheme.accentPrimary == null) {
                    darkTheme.accentPrimary = docsDbConfig.colorsV2.accentPrimary.color;
                }
                if (lightTheme.accentPrimary == null) {
                    lightTheme.accentPrimary = docsDbConfig.colorsV2.accentPrimary.color;
                }
            }
        }
    }

    // then, copy anything from colorsV1 that hasn't been set by colorsV2 or colorsV3
    if (docsDbConfig.colors != null) {
        if (docsDbConfig.colors.accentPrimary != null) {
            // we don't know at this point whether accentPrimary is dark or light, so we'll set both
            // but we don't mark hasDarkMode or hasLightMode as true, because we don't know which it is
            if (darkTheme.accentPrimary == null) {
                darkTheme.accentPrimary = docsDbConfig.colors.accentPrimary;
            }
            if (lightTheme.accentPrimary == null) {
                lightTheme.accentPrimary = docsDbConfig.colors.accentPrimary;
            }
        }
    }

    if (docsDbConfig.logoV2 != null) {
        if (darkTheme.logo == null) {
            darkTheme.logo = docsDbConfig.logoV2.dark;
        }
        if (lightTheme.logo == null) {
            lightTheme.logo = docsDbConfig.logoV2.light;
        }
    }

    if (docsDbConfig.logo != null) {
        if (darkTheme.logo == null) {
            darkTheme.logo = docsDbConfig.logo;
        }
        if (lightTheme.logo == null) {
            lightTheme.logo = docsDbConfig.logo;
        }
    }

    if (docsDbConfig.backgroundImage != null) {
        if (darkTheme.backgroundImage == null) {
            darkTheme.backgroundImage = docsDbConfig.backgroundImage;
        }
        if (lightTheme.backgroundImage == null) {
            lightTheme.backgroundImage = docsDbConfig.backgroundImage;
        }
    }

    // finally, fill in any missing properties with the defaults
    const dark = { ...EMPTY_DARK_THEME, ...darkTheme };
    const light = { ...EMPTY_LIGHT_THEME, ...lightTheme };

    if (hasDarkMode && hasLightMode) {
        return { type: "darkAndLight", dark, light };
    } else if (hasDarkMode) {
        return { type: "dark", ...dark };
    } else if (hasLightMode) {
        return { type: "light", ...light };
    } else {
        // fallback to dark and light
        return { type: "darkAndLight", dark, light };
    }
}
function migrateApiNavigationV1ToV2(
    navigation: DocsV1Read.ApiNavigationConfigRootV1 | undefined,
    api: APIV1Read.ApiDefinition | undefined,
): DocsV1Read.ApiNavigationConfigRootV2 | undefined {
    if (navigation == null) {
        return undefined;
    }

    if (api == null) {
        throw new Error("API definition not found");
    }

    return {
        summaryPageId: navigation.summaryPageId,
        items: navigation.items.map((item) => migrateApiNavigationItemV1ToV2(item, api, [])),
    };
}

function migrateApiNavigationItemV1ToV2(
    item: DocsV1Read.ApiNavigationConfigItemV1,
    api: APIV1Read.ApiDefinition,
    parentSubpackageIds: string[],
): DocsV1Read.ApiNavigationConfigItemV2 {
    switch (item.type) {
        case "page":
            return item;
        case "subpackage":
            return {
                type: "section",
                summaryPageId: item.summaryPageId,
                // subpackageId: item.subpackageId,
                id: {
                    type: "subpackage",
                    value: item.subpackageId,
                },
                items: item.items.map((innerItem) =>
                    migrateApiNavigationItemV1ToV2(innerItem, api, [...parentSubpackageIds, item.subpackageId]),
                ),
                urlSlug: undefined,
            };
        case "endpointId":
            return {
                type: "node",
                value: {
                    type: "endpoint",
                    endpointId: item.value,
                    subpackageLocator: parentSubpackageIds,
                    urlSlug: undefined,
                },
            };
        case "webhookId":
            return {
                type: "node",
                value: {
                    type: "webhook",
                    subpackageLocator: parentSubpackageIds,
                    webhookId: item.value,
                    urlSlug: undefined,
                },
            };
        case "websocketId":
            return {
                type: "node",
                value: {
                    type: "websocket",
                    subpackageLocator: parentSubpackageIds,
                    webSocketId: item.value,
                    urlSlug: undefined,
                },
            };
    }
}
