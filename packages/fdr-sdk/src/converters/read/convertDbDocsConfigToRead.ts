import { kebabCase } from "es-toolkit/string";
import tinycolor from "tinycolor2";

import assertNever from "@fern-api/ui-core-utils/assertNever";

import {
  DocsV1Db,
  DocsV1Read,
  visitDbNavigationConfig,
  visitUnversionedDbNavigationConfig,
} from "../../client";
import { visitDbNavigationTab } from "../../client/visitNavigationTab";
import {
  DEFAULT_DARK_MODE_ACCENT_PRIMARY,
  DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
} from "../utils/colors";

export function convertDbDocsConfigToRead({
  dbShape,
}: {
  dbShape: DocsV1Db.DocsDbConfig;
}): DocsV1Read.DocsConfig {
  return {
    navigation:
      dbShape.navigation != null
        ? transformNavigationConfigToRead(dbShape.navigation)
        : undefined,
    root: dbShape.root,
    logoHeight: dbShape.logoHeight,
    logoHref: dbShape.logoHref,
    colorsV3: dbShape.colorsV3 ?? getColorsV3(dbShape),
    navbarLinks: dbShape.navbarLinks,
    footerLinks: dbShape.footerLinks,
    hideNavLinks: dbShape.hideNavLinks,
    title: dbShape.title,
    favicon: dbShape.favicon,
    typographyV2:
      dbShape.typographyV2 ?? transformTypographyToV2(dbShape.typography),
    layout: dbShape.layout,
    css: dbShape.css,
    js: dbShape.js,
    metadata: dbShape.metadata,
    redirects: dbShape.redirects,
    integrations: dbShape.integrations,
    defaultLanguage: dbShape.defaultLanguage,
    analyticsConfig: dbShape.analyticsConfig,
    announcement: dbShape.announcement,
  };
}

function transformFontConfigToV2(
  fontConfig: DocsV1Read.FontConfig | undefined
): DocsV1Read.FontConfigV2 | undefined {
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
  typography: DocsV1Read.DocsTypographyConfig | undefined
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

// function transformFontConfigV2ToV1(fontConfig: DocsV1Read.FontConfigV2 | undefined): DocsV1Read.FontConfig | undefined {
//     if (fontConfig == null) {
//         return undefined;
//     }
//     const firstVariant = fontConfig.variants[0];
//     if (firstVariant == null) {
//         return undefined;
//     }
//     return {
//         name: fontConfig.name,
//         fontFile: firstVariant.fontFile,
//     };
// }

// function transformTypographyV2ToV1(
//     typography: DocsV1Read.DocsTypographyConfigV2 | undefined,
// ): DocsV1Read.DocsTypographyConfig | undefined {
//     if (typography == null) {
//         return undefined;
//     }
//     return {
//         headingsFont: transformFontConfigV2ToV1(typography.headingsFont),
//         bodyFont: transformFontConfigV2ToV1(typography.bodyFont),
//         codeFont: transformFontConfigV2ToV1(typography.codeFont),
//     };
// }

export function transformNavigationConfigToRead(
  dbShape: DocsV1Db.NavigationConfig
): DocsV1Read.NavigationConfig {
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
  config: DocsV1Db.VersionedNavigationConfig
): DocsV1Read.VersionedNavigationConfig {
  return {
    versions: config.versions.map(
      (version): DocsV1Read.VersionedNavigationConfigData => ({
        urlSlug: version.urlSlug ?? kebabCase(version.version),
        availability: version.availability,
        version: version.version,
        config: transformUnversionedNavigationConfigForDb(version.config),
      })
    ),
  };
}

function transformUnversionedNavigationConfigForDb(
  config: DocsV1Db.UnversionedNavigationConfig
): DocsV1Read.UnversionedNavigationConfig {
  return visitUnversionedDbNavigationConfig<DocsV1Read.UnversionedNavigationConfig>(
    config,
    {
      tabbed: (config) => {
        return {
          tabs:
            config.tabsV2?.map(transformNavigationTabV2ForDb) ??
            config.tabs?.map(transformNavigationTabForDb) ??
            [],
          landingPage: config.landingPage,
        };
      },
      untabbed: (config) => {
        return {
          items: config.items.map(transformNavigationItemForDb),
          landingPage: config.landingPage,
        };
      },
    }
  );
}

export function transformNavigationTabForDb(
  dbShape: DocsV1Db.NavigationTab
): DocsV1Read.NavigationTab {
  return visitDbNavigationTab<DocsV1Read.NavigationTab>(dbShape, {
    link: (link) => ({ type: "link", ...link }),
    group: (group) => ({
      type: "group",
      ...group,
      items: group.items.map(transformNavigationItemForDb),
      skipUrlSlug: group.skipUrlSlug ?? false,
      hidden: undefined,
      fullSlug: undefined,
    }),
  });
}

export function transformNavigationTabV2ForDb(
  dbShape: DocsV1Db.NavigationTabV2
): DocsV1Read.NavigationTab {
  switch (dbShape.type) {
    case "link":
      return dbShape;
    case "group":
      return {
        ...dbShape,
        items: dbShape.items.map(transformNavigationItemForDb),
        skipUrlSlug: dbShape.skipUrlSlug ?? false,
        hidden: undefined,
        fullSlug: undefined,
      };
    case "changelog":
    case "changelogV3":
      return dbShape;
    default:
      assertNever(dbShape);
  }
}

export function isNavigationTabLink(
  tab: DocsV1Db.NavigationTab
): tab is DocsV1Read.NavigationTabLink {
  return (tab as DocsV1Read.NavigationTabLink).url != null;
}

export function transformNavigationItemForDb(
  dbShape: DocsV1Db.NavigationItem
): DocsV1Read.NavigationItem {
  switch (dbShape.type) {
    case "api":
      return {
        ...dbShape,
        showErrors: dbShape.showErrors ?? false,
      };
    case "section":
      return {
        ...dbShape,
        items: dbShape.items.map((item) => transformNavigationItemForDb(item)),
      };
    case "page":
    case "link":
    case "changelog":
    case "apiV2":
    case "changelogV3":
      return dbShape;
    default:
      assertNever(dbShape);
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

export function getColorsV3(
  docsDbConfig: DocsV1Db.DocsDbConfig
): DocsV1Read.ColorsConfigV3 {
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
        if (
          docsDbConfig.colorsV2.background.dark != null &&
          darkTheme.background == null
        ) {
          hasDarkMode = true;
          darkTheme.background = {
            type: "solid",
            ...docsDbConfig.colorsV2.background.dark,
          };
        }
        if (
          docsDbConfig.colorsV2.background.light != null &&
          lightTheme.background == null
        ) {
          hasLightMode = true;
          lightTheme.background = {
            type: "solid",
            ...docsDbConfig.colorsV2.background.light,
          };
        }
      } else if (docsDbConfig.colorsV2.background.type === "unthemed") {
        if (docsDbConfig.colorsV2.background.color != null) {
          // the background color is a good way to tell if we're in dark mode or light mode
          // check the percieved brightness of the color:

          if (tinycolor(docsDbConfig.colorsV2.background.color).isDark()) {
            hasDarkMode = true;
            darkTheme.background = {
              type: "solid",
              ...docsDbConfig.colorsV2.background.color,
            };
          } else {
            hasLightMode = true;
            lightTheme.background = {
              type: "solid",
              ...docsDbConfig.colorsV2.background.color,
            };
          }
        }
      }
    }

    if (docsDbConfig.colorsV2.accentPrimary?.type === "themed") {
      if (
        docsDbConfig.colorsV2.accentPrimary.dark != null &&
        darkTheme.accentPrimary == null
      ) {
        hasDarkMode = true;
        darkTheme.accentPrimary = docsDbConfig.colorsV2.accentPrimary.dark;
      }

      if (
        docsDbConfig.colorsV2.accentPrimary.light != null &&
        lightTheme.accentPrimary == null
      ) {
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
