import assertNever from "@fern-api/ui-core-utils/assertNever";
import { kebabCase } from "es-toolkit/string";
import { FernNavigation } from "../..";
import {
    DocsV1Db,
    DocsV1Read,
    DocsV1Write,
    FdrAPI,
    visitDbNavigationConfig,
    visitUnversionedDbNavigationConfig,
    visitUnversionedWriteNavigationConfig,
    visitWriteNavigationConfig,
} from "../../client";
import { isNavigationTabLink } from "../../client/visitNavigationTab";
import {
    DEFAULT_DARK_MODE_ACCENT_PRIMARY,
    DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
} from "../utils/colors";

export interface S3FileInfo {
    presignedUrl: DocsV1Write.FileS3UploadUrl;
    key: string;
    imageMetadata:
        | {
              width: number;
              height: number;
              blurDataUrl: string | undefined;
              alt: string | undefined;
          }
        | undefined;
}

type ConvertedDocsDefinition = DocsV1Db.DocsDefinitionDb.V3 & {
    config: DocsV1Db.DocsDbConfig;
};

export function convertDocsDefinitionToDb({
    writeShape,
    files,
}: {
    writeShape: DocsV1Write.DocsDefinition;
    files: Record<DocsV1Write.FilePath, S3FileInfo>;
}): ConvertedDocsDefinition {
    const navigationConfig: DocsV1Db.NavigationConfig | undefined = writeShape
        .config.navigation
        ? transformNavigationConfigForDb(writeShape.config.navigation)
        : undefined;
    const transformedFiles: Record<DocsV1Write.FileId, DocsV1Db.DbFileInfoV2> =
        {};
    Object.entries(files).forEach(([, s3FileInfo]) => {
        transformedFiles[s3FileInfo.presignedUrl.fileId] =
            s3FileInfo.imageMetadata != null
                ? {
                      type: "image",
                      s3Key: s3FileInfo.key,
                      width: s3FileInfo.imageMetadata.width,
                      height: s3FileInfo.imageMetadata.height,
                      blurDataUrl: s3FileInfo.imageMetadata.blurDataUrl,
                      alt: s3FileInfo.imageMetadata.alt,
                  }
                : {
                      type: "s3Key",
                      s3Key: s3FileInfo.key,
                  };
    });

    const logo = writeShape.config.logo;
    let logoV2 = writeShape.config.logoV2;

    if (logoV2 == null && logo != null) {
        logoV2 = { dark: logo, light: undefined };
    }

    const colors = writeShape.config.colors;
    let colorsV2 = writeShape.config.colorsV2;

    if (colorsV2 == null && colors != null) {
        colorsV2 = {
            accentPrimary: {
                type: "themed",
                dark: colors.accentPrimary,
                light: undefined,
            },
            background: undefined,
        };
    }

    return {
        type: "v3",
        referencedApis: getReferencedApiDefinitionIds(
            navigationConfig,
            writeShape.config.root
        ),
        files: transformedFiles,
        config: {
            navigation: navigationConfig,
            root: writeShape.config.root,
            logo,
            logoV2,
            logoHeight: writeShape.config.logoHeight,
            logoHref: writeShape.config.logoHref,
            colors,
            colorsV2,
            colorsV3:
                writeShape.config.colorsV3 != null
                    ? transformColorsV3ForDb({
                          writeShape: writeShape.config.colorsV3,
                          docsConfig: writeShape.config,
                      })
                    : undefined,
            navbarLinks: writeShape.config.navbarLinks,
            footerLinks: writeShape.config.footerLinks,
            title: writeShape.config.title,
            favicon: writeShape.config.favicon,
            backgroundImage: writeShape.config.backgroundImage,
            typography: writeShape.config.typography,
            typographyV2: writeShape.config.typographyV2,
            layout: writeShape.config.layout,
            css: writeShape.config.css,
            js: writeShape.config.js,
            metadata: writeShape.config.metadata,
            redirects: writeShape.config.redirects,
            integrations: writeShape.config.integrations,
            defaultLanguage: writeShape.config.defaultLanguage,
            analyticsConfig: writeShape.config.analyticsConfig,
            announcement: writeShape.config.announcement,
        },
        pages: writeShape.pages,
        jsFiles: writeShape.jsFiles,
    };
}

export function transformNavigationConfigForDb(
    writeShape: DocsV1Write.NavigationConfig
): DocsV1Db.NavigationConfig {
    return visitWriteNavigationConfig<DocsV1Db.NavigationConfig>(writeShape, {
        unversioned: (config) => {
            return transformUnversionedNavigationConfigForDb(config);
        },
        versioned: (config) => {
            return transformVersionedNavigationConfigForDb(config);
        },
    });
}

function transformVersionedNavigationConfigForDb(
    config: DocsV1Write.VersionedNavigationConfig
): DocsV1Db.VersionedNavigationConfig {
    return {
        versions: config.versions.map(
            (version): DocsV1Db.VersionedNavigationConfigData => ({
                urlSlug: version.urlSlugOverride ?? kebabCase(version.version),
                availability: version.availability,
                version: version.version,
                config: transformUnversionedNavigationConfigForDb(
                    version.config
                ),
            })
        ),
    };
}

function transformUnversionedNavigationConfigForDb(
    writeShape: DocsV1Write.UnversionedNavigationConfig
): DocsV1Db.UnversionedNavigationConfig {
    return visitUnversionedWriteNavigationConfig<DocsV1Db.UnversionedNavigationConfig>(
        writeShape,
        {
            untabbed: (config) => {
                return {
                    items: config.items?.map(transformNavigationItemForDb),
                    // landing page's slug should be "" because it's the root
                    landingPage: transformPageNavigationItemForDb(
                        config.landingPage,
                        ""
                    ),
                };
            },
            tabbed: (config) => {
                return {
                    tabs: config.tabs?.map(transformNavigationTabForDb),
                    tabsV2: config.tabsV2?.map(transformNavigationTabV2ForDb),
                    landingPage: transformPageNavigationItemForDb(
                        config.landingPage,
                        ""
                    ),
                };
            },
        }
    );
}

export function transformNavigationTabForDb(
    writeShape: DocsV1Write.NavigationTab
): DocsV1Db.NavigationTab {
    if (isNavigationTabLink(writeShape)) {
        return writeShape;
    }
    return {
        ...writeShape,
        items: writeShape.items?.map(transformNavigationItemForDb),
        urlSlug:
            writeShape.urlSlugOverride ?? kebabCase(writeShape.title ?? ""),
    };
}

function transformNavigationTabV2ForDb(
    writeShape: DocsV1Write.NavigationTabV2
): DocsV1Db.NavigationTabV2 {
    switch (writeShape.type) {
        case "group":
            return {
                ...writeShape,
                items: writeShape.items.map(transformNavigationItemForDb),
                urlSlug:
                    writeShape.urlSlugOverride ?? kebabCase(writeShape.title),
            };
        case "link":
            return writeShape;
        case "changelog": {
            return { type: "changelog", ...toChangelogDb(writeShape) };
        }
        case "changelogV3": {
            return writeShape;
        }
    }
}

function toChangelogDb(
    writeShape: DocsV1Write.ChangelogSectionV2
): DocsV1Read.ChangelogSection {
    return {
        title: writeShape.title,
        icon: writeShape.icon,
        hidden: writeShape.hidden ?? false,
        description: writeShape.description,
        items: writeShape.items.map((item) => ({
            date: item.date,
            pageId: item.pageId,
        })),
        pageId: writeShape.pageId,
        urlSlug:
            writeShape.urlSlugOverride ??
            (writeShape.title != null
                ? kebabCase(writeShape.title)
                : "changelog"),
        fullSlug: writeShape.fullSlug,
    };
}

export function transformNavigationItemForDb(
    writeShape: DocsV1Write.NavigationItem
): DocsV1Db.NavigationItem {
    switch (writeShape.type) {
        case "api":
            return {
                ...writeShape,
                icon: writeShape.icon,
                hidden: writeShape.hidden ?? false,
                longScrolling: writeShape.longScrolling,
                flattened: writeShape.flattened,
                fullSlug: writeShape.fullSlug,
                urlSlug:
                    writeShape.urlSlugOverride ?? kebabCase(writeShape.title),
                artifacts:
                    writeShape.artifacts != null
                        ? transformArtifactsForReading(writeShape.artifacts)
                        : undefined,
                skipUrlSlug: writeShape.skipUrlSlug ?? false,
                showErrors: writeShape.showErrors ?? false,
                changelog:
                    writeShape.changelog != null
                        ? {
                              title: writeShape.changelog.title,
                              description: writeShape.changelog.description,
                              items: writeShape.changelog.items.map((item) => ({
                                  date: item.date,
                                  pageId: item.pageId,
                              })),
                              pageId: writeShape.changelog.pageId,
                              urlSlug: writeShape.changelog.urlSlug,
                              fullSlug: writeShape.fullSlug,
                              icon: writeShape.changelog.icon,
                              hidden: writeShape.changelog.hidden ?? false,
                          }
                        : undefined,
                navigation: transformApiSectionNavigationForDb(
                    writeShape.navigation
                ),
            };
        case "page":
            return transformPageNavigationItemForDb(writeShape);
        case "section":
            return {
                type: "section",
                title: writeShape.title,
                icon: writeShape.icon,
                urlSlug:
                    writeShape.urlSlugOverride ?? kebabCase(writeShape.title),
                collapsed: writeShape.collapsed ?? false,
                hidden: writeShape.hidden ?? false,
                items: writeShape.items.map((item) =>
                    transformNavigationItemForDb(item)
                ),
                skipUrlSlug: writeShape.skipUrlSlug ?? false,
                fullSlug: writeShape.fullSlug,
                overviewPageId: writeShape.overviewPageId,
            };
        case "link":
            return {
                type: "link",
                title: writeShape.title,
                icon: writeShape.icon,
                url: writeShape.url,
            };
        case "changelog":
            return { type: "changelog", ...toChangelogDb(writeShape) };
        case "apiV2":
            return writeShape;
        case "changelogV3":
            return writeShape;
        default:
            assertNever(writeShape);
    }
}

export function getReferencedApiDefinitionIds(
    navigationConfig: DocsV1Db.NavigationConfig | undefined,
    root: FernNavigation.V1.RootNode | undefined
): FdrAPI.ApiDefinitionId[] {
    if (root != null) {
        const latest =
            FernNavigation.migrate.FernNavigationV1ToLatest.create().root(root);
        return FernNavigation.utils
            .collectApiReferences(latest)
            .map((reference) => reference.apiDefinitionId);
    }

    if (navigationConfig != null) {
        return visitDbNavigationConfig(navigationConfig, {
            unversioned: (config) =>
                getReferencedApiDefinitionIdsForUnversionedReadConfig(config),
            versioned: (config) =>
                config.versions.flatMap((version) =>
                    getReferencedApiDefinitionIdsForUnversionedReadConfig(
                        version.config
                    )
                ),
        });
    }

    return [];
}

function getReferencedApiDefinitionIdsForUnversionedReadConfig(
    config: DocsV1Db.UnversionedNavigationConfig
): FdrAPI.ApiDefinitionId[] {
    return visitUnversionedDbNavigationConfig<FdrAPI.ApiDefinitionId[]>(
        config,
        {
            untabbed: (config) =>
                config.items.flatMap(getReferencedApiDefinitionIdFromItem),
            tabbed: (config) => {
                const toRet: FdrAPI.ApiDefinitionId[] = [];
                config.tabs?.forEach((tab) => {
                    if (isNavigationTabLink(tab)) {
                        return;
                    } else {
                        if (tab.items) {
                            toRet.push(
                                ...tab.items.flatMap(
                                    getReferencedApiDefinitionIdFromItem
                                )
                            );
                        }
                    }
                });
                config.tabsV2?.forEach((tab) => {
                    if (tab.type === "group") {
                        if (tab.items) {
                            toRet.push(
                                ...tab.items.flatMap(
                                    getReferencedApiDefinitionIdFromItem
                                )
                            );
                        }
                    }
                });
                return toRet;
            },
        }
    );
}

function getReferencedApiDefinitionIdFromItem(
    item: DocsV1Db.NavigationItem
): FdrAPI.ApiDefinitionId[] {
    switch (item.type) {
        case "api":
            return [item.api];
        case "page":
            return [];
        case "section":
            return item.items.flatMap((sectionItem) =>
                getReferencedApiDefinitionIdFromItem(sectionItem)
            );
        case "link":
            return [];
        case "changelog":
            return [];
        case "apiV2":
            return [item.node.apiDefinitionId];
        case "changelogV3":
            return [];
        default:
            assertNever(item);
    }
}

function transformArtifactsForReading(
    writeShape: DocsV1Write.ApiArtifacts
): DocsV1Read.ApiArtifacts {
    return {
        sdks: writeShape.sdks.map((sdk) =>
            transformPublishedSdkForReading(sdk)
        ),
        postman:
            writeShape.postman != null
                ? transformPublishedPostmanCollectionForReading(
                      writeShape.postman
                  )
                : undefined,
    };
}

function transformPublishedSdkForReading(
    writeShape: DocsV1Write.PublishedSdk
): DocsV1Read.PublishedSdk {
    switch (writeShape.type) {
        case "maven":
            return {
                type: "maven",
                coordinate: writeShape.coordinate,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: FdrAPI.Url(
                        `https://github.com/${writeShape.githubRepoName}`
                    ),
                },
                version: writeShape.version,
            };
        case "npm":
            return {
                type: "npm",
                packageName: writeShape.packageName,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: FdrAPI.Url(
                        `https://github.com/${writeShape.githubRepoName}`
                    ),
                },
                version: writeShape.version,
            };
        case "pypi":
            return {
                type: "pypi",
                packageName: writeShape.packageName,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: FdrAPI.Url(
                        `https://github.com/${writeShape.githubRepoName}`
                    ),
                },
                version: writeShape.version,
            };
    }
}

function transformPublishedPostmanCollectionForReading(
    writeShape: DocsV1Write.PublishedPostmanCollection
): DocsV1Read.PublishedPostmanCollection {
    return {
        url: writeShape.url,
        githubRepo:
            writeShape.githubRepoName != null
                ? {
                      name: writeShape.githubRepoName,
                      url: FdrAPI.Url(
                          `https://github.com/${writeShape.githubRepoName}`
                      ),
                  }
                : undefined,
    };
}

function transformColorsV3ForDb({
    writeShape,
    docsConfig,
}: {
    writeShape: DocsV1Write.ColorsConfigV3;
    docsConfig: DocsV1Write.DocsConfig;
}): DocsV1Read.ColorsConfigV3 {
    switch (writeShape.type) {
        case "dark":
            return {
                type: "dark",
                accentPrimary:
                    writeShape.accentPrimary ??
                    DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                logo:
                    writeShape.logo ??
                    docsConfig.logoV2?.dark ??
                    docsConfig.logo,
                background:
                    writeShape.background != null
                        ? { type: "solid", ...writeShape.background }
                        : { type: "gradient" },
                backgroundImage:
                    writeShape.backgroundImage ?? docsConfig.backgroundImage,
                border: writeShape.border,
                cardBackground: writeShape.cardBackground,
                sidebarBackground: writeShape.sidebarBackground,
                headerBackground: writeShape.headerBackground,
            };
        case "light":
            return {
                type: "light",
                accentPrimary:
                    writeShape.accentPrimary ??
                    DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                logo:
                    writeShape.logo ??
                    docsConfig.logoV2?.dark ??
                    docsConfig.logo,
                background:
                    writeShape.background != null
                        ? { type: "solid", ...writeShape.background }
                        : { type: "gradient" },
                backgroundImage:
                    writeShape.backgroundImage ?? docsConfig.backgroundImage,
                border: writeShape.border,
                cardBackground: writeShape.cardBackground,
                sidebarBackground: writeShape.sidebarBackground,
                headerBackground: writeShape.headerBackground,
            };
        case "darkAndLight":
            return {
                type: "darkAndLight",
                light: {
                    accentPrimary:
                        writeShape.light.accentPrimary ??
                        DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                    logo:
                        writeShape.light.logo ??
                        docsConfig.logoV2?.light ??
                        docsConfig.logo,
                    background:
                        writeShape.light.background != null
                            ? { type: "solid", ...writeShape.light.background }
                            : { type: "gradient" },
                    backgroundImage:
                        writeShape.light.backgroundImage ??
                        docsConfig.backgroundImage,
                    border: writeShape.light.border,
                    cardBackground: writeShape.light.cardBackground,
                    sidebarBackground: writeShape.light.sidebarBackground,
                    headerBackground: writeShape.light.headerBackground,
                },
                dark: {
                    accentPrimary:
                        writeShape.dark.accentPrimary ??
                        DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                    logo:
                        writeShape.dark.logo ??
                        docsConfig.logoV2?.dark ??
                        docsConfig.logo,
                    background:
                        writeShape.dark.background != null
                            ? { type: "solid", ...writeShape.dark.background }
                            : { type: "gradient" },
                    backgroundImage:
                        writeShape.dark.backgroundImage ??
                        docsConfig.backgroundImage,
                    border: writeShape.dark.border,
                    cardBackground: writeShape.dark.cardBackground,
                    sidebarBackground: writeShape.dark.sidebarBackground,
                    headerBackground: writeShape.dark.headerBackground,
                },
            };
        default:
            assertNever(writeShape);
    }
}

function transformPageNavigationItemForDb(
    writeShape: DocsV1Write.PageMetadata,
    defaultSlug?: string
): DocsV1Read.NavigationItem.Page;
function transformPageNavigationItemForDb(
    writeShape: DocsV1Write.PageMetadata | undefined,
    defaultSlug?: string
): DocsV1Read.NavigationItem.Page | undefined;
function transformPageNavigationItemForDb(
    writeShape: DocsV1Write.PageMetadata | undefined,
    defaultSlug?: string
): DocsV1Read.NavigationItem.Page | undefined {
    if (writeShape == null) {
        return undefined;
    }
    return {
        type: "page",
        id: writeShape.id,
        title: writeShape.title,
        icon: writeShape.icon,
        urlSlug:
            writeShape.urlSlugOverride ??
            defaultSlug ??
            kebabCase(writeShape.title),
        fullSlug: writeShape.fullSlug,
        hidden: writeShape.hidden ?? false,
    };
}

function transformApiSectionNavigationForDb(
    writeShape: DocsV1Write.ApiNavigationConfigRoot | undefined
): DocsV1Db.ApiSection["navigation"] | undefined {
    if (writeShape == null) {
        return undefined;
    }
    return {
        items: transformItems(writeShape.items),
        summaryPageId: writeShape.summaryPageId,
    };
}

function transformItems(items: DocsV1Write.ApiNavigationConfigItem[]) {
    return items.map((item): DocsV1Read.ApiNavigationConfigItem => {
        if (item.type === "subpackage") {
            return {
                type: "subpackage",
                subpackageId: item.subpackageId,
                items: transformItems(item.items),
                summaryPageId: item.summaryPageId,
            };
        } else if (item.type === "page") {
            return transformPageNavigationItemForDb(item);
        }
        return item;
    });
}
