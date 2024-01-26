import { kebabCase } from "lodash";
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
import { type WithoutQuestionMarks } from "../utils/WithoutQuestionMarks";
import { assertNever } from "../utils/assertNever";
import { DEFAULT_DARK_MODE_ACCENT_PRIMARY, DEFAULT_LIGHT_MODE_ACCENT_PRIMARY } from "../utils/colors";

export interface S3FileInfo {
    presignedUrl: DocsV1Write.FileS3UploadUrl;
    key: string;
}

type ConvertedDocsDefinition = WithoutQuestionMarks<DocsV1Db.DocsDefinitionDb.V2> & {
    config: WithoutQuestionMarks<DocsV1Db.DocsDbConfig>;
};

export function convertDocsDefinitionToDb({
    writeShape,
    files,
}: {
    writeShape: DocsV1Write.DocsDefinition;
    files: Record<DocsV1Write.FilePath, S3FileInfo>;
}): ConvertedDocsDefinition {
    const navigationConfig: DocsV1Db.NavigationConfig = transformNavigationConfigForDb(writeShape.config.navigation);
    const transformedFiles: Record<DocsV1Write.FileId, DocsV1Db.DbFileInfo> = {};
    Object.entries(files).forEach(([, s3FileInfo]) => {
        transformedFiles[s3FileInfo.presignedUrl.fileId] = {
            s3Key: s3FileInfo.key,
        };
    });

    const logo = writeShape.config.logo;
    let logoV2 = writeShape.config.logoV2;

    if (logoV2 == null && logo != null) {
        logoV2 = { dark: logo };
    }

    const colors = writeShape.config.colors;
    let colorsV2 = writeShape.config.colorsV2;

    if (colorsV2 == null && colors != null) {
        colorsV2 = {
            accentPrimary: {
                type: "themed",
                dark: colors.accentPrimary,
            },
        };
    }

    return {
        type: "v2",
        referencedApis: getReferencedApiDefinitionIds(navigationConfig),
        files: transformedFiles,
        config: {
            navigation: navigationConfig,
            logo,
            logoV2,
            logoHeight: writeShape.config.logoHeight,
            logoHref: writeShape.config.logoHref,
            colors,
            colorsV2,
            colorsV3:
                writeShape.config.colorsV3 != null
                    ? transformColorsV3ForDb({ writeShape: writeShape.config.colorsV3, docsConfig: writeShape.config })
                    : undefined,
            navbarLinks: writeShape.config.navbarLinks ?? [],
            title: writeShape.config.title,
            favicon: writeShape.config.favicon,
            backgroundImage: writeShape.config.backgroundImage,
            typography: writeShape.config.typography,
            typographyV2: writeShape.config.typographyV2,
            layout: writeShape.config.layout,
        },
        pages: writeShape.pages,
        colors: {
            accentPrimary: writeShape.config.colors?.accentPrimary,
        },
        typography: writeShape.config.typography,
    };
}

export function transformNavigationConfigForDb(writeShape: DocsV1Write.NavigationConfig): DocsV1Db.NavigationConfig {
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
    config: DocsV1Write.VersionedNavigationConfig,
): WithoutQuestionMarks<DocsV1Db.VersionedNavigationConfig> {
    return {
        versions: config.versions.map(
            (version): WithoutQuestionMarks<DocsV1Db.VersionedNavigationConfigData> => ({
                urlSlug: version.urlSlugOverride ?? kebabCase(version.version),
                availability: version.availability,
                version: version.version,
                config: transformUnversionedNavigationConfigForDb(version.config),
            }),
        ),
    };
}

function transformUnversionedNavigationConfigForDb(
    writeShape: DocsV1Write.UnversionedNavigationConfig,
): DocsV1Db.UnversionedNavigationConfig {
    return visitUnversionedWriteNavigationConfig<DocsV1Db.UnversionedNavigationConfig>(writeShape, {
        untabbed: (config) => {
            return {
                items: config.items.map(transformNavigationItemForDb),
            };
        },
        tabbed: (config) => {
            return {
                tabs: config.tabs.map(transformNavigationTabForDb),
            };
        },
    });
}

export function transformNavigationTabForDb(writeShape: DocsV1Write.NavigationTab): DocsV1Db.NavigationTab {
    return {
        ...writeShape,
        items: writeShape.items.map(transformNavigationItemForDb),
        urlSlug: kebabCase(writeShape.title),
    };
}

export function transformNavigationItemForDb(writeShape: DocsV1Write.NavigationItem): DocsV1Db.NavigationItem {
    switch (writeShape.type) {
        case "api":
            return {
                ...writeShape,
                urlSlug: kebabCase(writeShape.title),
                artifacts:
                    writeShape.artifacts != null ? transformArtifactsForReading(writeShape.artifacts) : undefined,
                skipUrlSlug: writeShape.skipUrlSlug ?? false,
                showErrors: writeShape.showErrors ?? false,
            };
        case "page":
            return {
                type: "page",
                id: writeShape.id,
                title: writeShape.title,
                urlSlug: writeShape.urlSlugOverride ?? kebabCase(writeShape.title),
            };
        case "section":
            return {
                type: "section",
                title: writeShape.title,
                urlSlug: writeShape.urlSlugOverride ?? kebabCase(writeShape.title),
                collapsed: writeShape.collapsed ?? false,
                items: writeShape.items.map((item) => transformNavigationItemForDb(item)),
                skipUrlSlug: writeShape.skipUrlSlug ?? false,
            };
    }
}

export function getReferencedApiDefinitionIds(navigationConfig: DocsV1Db.NavigationConfig): FdrAPI.ApiDefinitionId[] {
    return visitDbNavigationConfig(navigationConfig, {
        unversioned: (config) => {
            return getReferencedApiDefinitionIdsForUnversionedReadConfig(config);
        },
        versioned: (config) => {
            return config.versions.flatMap((version) =>
                getReferencedApiDefinitionIdsForUnversionedReadConfig(version.config),
            );
        },
    });
}

function getReferencedApiDefinitionIdsForUnversionedReadConfig(
    config: DocsV1Db.UnversionedNavigationConfig,
): FdrAPI.ApiDefinitionId[] {
    return visitUnversionedDbNavigationConfig<FdrAPI.ApiDefinitionId[]>(config, {
        untabbed: (config) => {
            return config.items.flatMap(getReferencedApiDefinitionIdFromItem);
        },
        tabbed: (config) => {
            return config.tabs.flatMap((tab) => tab.items.flatMap(getReferencedApiDefinitionIdFromItem));
        },
    });
}

function getReferencedApiDefinitionIdFromItem(item: DocsV1Db.NavigationItem): FdrAPI.ApiDefinitionId[] {
    switch (item.type) {
        case "api":
            return [item.api];
        case "page":
            return [];
        case "section":
            return item.items.flatMap((sectionItem) => getReferencedApiDefinitionIdFromItem(sectionItem));
        default:
            assertNever(item);
    }
}

function transformArtifactsForReading(
    writeShape: DocsV1Write.ApiArtifacts,
): WithoutQuestionMarks<DocsV1Read.ApiArtifacts> {
    return {
        sdks: writeShape.sdks.map((sdk) => transformPublishedSdkForReading(sdk)),
        postman:
            writeShape.postman != null ? transformPublishedPostmanCollectionForReading(writeShape.postman) : undefined,
    };
}

function transformPublishedSdkForReading(
    writeShape: DocsV1Write.PublishedSdk,
): WithoutQuestionMarks<DocsV1Read.PublishedSdk> {
    switch (writeShape.type) {
        case "maven":
            return {
                type: "maven",
                coordinate: writeShape.coordinate,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: `https://github.com/${writeShape.githubRepoName}`,
                },
                version: writeShape.version,
            };
        case "npm":
            return {
                type: "npm",
                packageName: writeShape.packageName,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: `https://github.com/${writeShape.githubRepoName}`,
                },
                version: writeShape.version,
            };
        case "pypi":
            return {
                type: "pypi",
                packageName: writeShape.packageName,
                githubRepo: {
                    name: writeShape.githubRepoName,
                    url: `https://github.com/${writeShape.githubRepoName}`,
                },
                version: writeShape.version,
            };
    }
}

function transformPublishedPostmanCollectionForReading(
    writeShape: DocsV1Write.PublishedPostmanCollection,
): WithoutQuestionMarks<DocsV1Read.PublishedPostmanCollection> {
    return {
        url: writeShape.url,
        githubRepo:
            writeShape.githubRepoName != null
                ? {
                      name: writeShape.githubRepoName,
                      url: `https://github.com/${writeShape.githubRepoName}`,
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
}): WithoutQuestionMarks<DocsV1Read.ColorsConfigV3> {
    switch (writeShape.type) {
        case "dark":
            return {
                type: "dark",
                accentPrimary: writeShape.accentPrimary ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                background:
                    writeShape.background != null ? { type: "solid", ...writeShape.background } : { type: "gradient" },
                logo: docsConfig.logoV2?.dark ?? docsConfig.logo,
            };
        case "light":
            return {
                type: "light",
                accentPrimary: writeShape.accentPrimary ?? DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                background:
                    writeShape.background != null ? { type: "solid", ...writeShape.background } : { type: "gradient" },
                logo: docsConfig.logoV2?.light,
            };
        case "darkAndLight":
            return {
                type: "darkAndLight",
                light: {
                    accentPrimary: writeShape.light.accentPrimary ?? DEFAULT_LIGHT_MODE_ACCENT_PRIMARY,
                    background:
                        writeShape.light.background != null
                            ? { type: "solid", ...writeShape.light.background }
                            : { type: "gradient" },
                    logo: docsConfig.logoV2?.light,
                },
                dark: {
                    accentPrimary: writeShape.dark.accentPrimary ?? DEFAULT_DARK_MODE_ACCENT_PRIMARY,
                    background:
                        writeShape.dark.background != null
                            ? { type: "solid", ...writeShape.dark.background }
                            : { type: "gradient" },
                    logo: docsConfig.logoV2?.dark ?? docsConfig.logo,
                },
            };
        default:
            assertNever(writeShape);
    }
}
