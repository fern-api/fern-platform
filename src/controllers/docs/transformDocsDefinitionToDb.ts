import { kebabCase } from "lodash";
import { FernRegistry } from "../../generated";
import type * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import type * as FernRegistryDocsWrite from "../../generated/api/resources/docs/resources/v1/resources/write";
import type { FileId, FilePath } from "../../generated/api/resources/docs/resources/v1/resources/write";
import { type S3FileInfo } from "../../services/s3";
import { assertNever, type WithoutQuestionMarks } from "../../util";
import { DEFAULT_DARK_MODE_CONFIG, DEFAULT_LIGHT_MODE_CONFIG } from "../../util/colors";
import {
    isUnversionedNavigationConfig as isUnversionedDbConfig,
    isUnversionedUntabbedNavigationConfig as isUnversionedUntabbedDbConfig,
    isVersionedNavigationConfig as isVersionedDbConfig,
} from "../../util/fern/db";
import {
    isUnversionedUntabbedNavigationConfig as isUnversionedUntabbedWriteConfig,
    isUnversionedNavigationConfig as isUnversionedWriteConfig,
    isVersionedNavigationConfig as isVersionedWriteConfig,
} from "../../util/fern/write";

export function transformWriteDocsDefinitionToDb({
    writeShape,
    files,
}: {
    writeShape: FernRegistry.docs.v1.write.DocsDefinition;
    files: Record<FilePath, S3FileInfo>;
}): WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2> {
    const navigationConfig: FernRegistryDocsDb.NavigationConfig = transformNavigationConfigForDb(
        writeShape.config.navigation
    );
    const transformedFiles: Record<FileId, FernRegistryDocsDb.DbFileInfo> = {};
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
        },
        pages: writeShape.pages,
        colors: {
            accentPrimary: writeShape.config.colors?.accentPrimary,
        },
        typography: writeShape.config.typography,
    };
}

export function transformNavigationConfigForDb(
    writeShape: FernRegistryDocsWrite.NavigationConfig
): FernRegistryDocsDb.NavigationConfig {
    if (isUnversionedWriteConfig(writeShape)) {
        return transformUnversionedNavigationConfigForDb(writeShape);
    } else if (isVersionedWriteConfig(writeShape)) {
        return transformVersionedNavigationConfigForDb(writeShape);
    }
    throw new Error("navigationConfig is neither unversioned nor versioned");
}

function transformVersionedNavigationConfigForDb(
    config: FernRegistryDocsWrite.VersionedNavigationConfig
): FernRegistryDocsDb.VersionedNavigationConfig {
    return {
        versions: config.versions.map((version) => ({
            version: version.version,
            config: transformUnversionedNavigationConfigForDb(version.config),
        })),
    };
}

function transformUnversionedNavigationConfigForDb(
    config: FernRegistryDocsWrite.UnversionedNavigationConfig
): FernRegistryDocsDb.UnversionedNavigationConfig {
    return isUnversionedUntabbedWriteConfig(config)
        ? {
              items: config.items.map(transformNavigationItemForDb),
          }
        : {
              tabs: config.tabs.map(transformNavigationTabForDb),
          };
}

export function transformNavigationTabForDb(
    writeShape: FernRegistry.docs.v1.write.NavigationTab
): FernRegistry.docs.v1.db.NavigationTab {
    return {
        ...writeShape,
        items: writeShape.items.map(transformNavigationItemForDb),
        urlSlug: kebabCase(writeShape.title),
    };
}

export function transformNavigationItemForDb(
    writeShape: FernRegistry.docs.v1.write.NavigationItem
): FernRegistry.docs.v1.db.NavigationItem {
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

export function getReferencedApiDefinitionIds(
    navigationConfig: FernRegistryDocsDb.NavigationConfig
): FernRegistry.ApiDefinitionId[] {
    if (isUnversionedDbConfig(navigationConfig)) {
        return getReferencedApiDefinitionIdsForUnversionedReadConfig(navigationConfig);
    } else if (isVersionedDbConfig(navigationConfig)) {
        return navigationConfig.versions.flatMap((version) =>
            getReferencedApiDefinitionIdsForUnversionedReadConfig(version.config)
        );
    }
    throw new Error("navigationConfig is neither unversioned nor versioned");
}

function getReferencedApiDefinitionIdsForUnversionedReadConfig(
    config: FernRegistryDocsDb.UnversionedNavigationConfig
): FernRegistry.ApiDefinitionId[] {
    return isUnversionedUntabbedDbConfig(config)
        ? config.items.flatMap(getReferencedApiDefinitionIdFromItem)
        : config.tabs.flatMap((tab) => tab.items.flatMap(getReferencedApiDefinitionIdFromItem));
}

function getReferencedApiDefinitionIdFromItem(item: FernRegistryDocsDb.NavigationItem): FernRegistry.ApiDefinitionId[] {
    switch (item.type) {
        case "api":
            return [item.api];
        case "page":
            return [];
        case "section":
            return item.items.flatMap((sectionItem) => getReferencedApiDefinitionIdFromItem(sectionItem));
    }
}

function transformArtifactsForReading(
    writeShape: FernRegistry.docs.v1.write.ApiArtifacts
): WithoutQuestionMarks<FernRegistry.docs.v1.read.ApiArtifacts> {
    return {
        sdks: writeShape.sdks.map((sdk) => transformPublishedSdkForReading(sdk)),
        postman:
            writeShape.postman != null ? transformPublishedPostmanCollectionForReading(writeShape.postman) : undefined,
    };
}

function transformPublishedSdkForReading(
    writeShape: FernRegistry.docs.v1.write.PublishedSdk
): WithoutQuestionMarks<FernRegistry.docs.v1.read.PublishedSdk> {
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
    writeShape: FernRegistry.docs.v1.write.PublishedPostmanCollection
): WithoutQuestionMarks<FernRegistry.docs.v1.read.PublishedPostmanCollection> {
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
    writeShape: FernRegistry.docs.v1.write.ColorsConfigV3;
    docsConfig: FernRegistry.docs.v1.write.DocsConfig;
}): WithoutQuestionMarks<FernRegistry.docs.v1.read.ColorsConfigV3> {
    switch (writeShape.type) {
        case "dark":
            return {
                type: "dark",
                accentPrimary: writeShape.accentPrimary ?? DEFAULT_DARK_MODE_CONFIG.accentPrimary,
                background: writeShape.background ?? DEFAULT_DARK_MODE_CONFIG.background,
                logo: docsConfig.logoV2?.dark ?? docsConfig.logo,
            };
        case "light":
            return {
                type: "light",
                accentPrimary: writeShape.accentPrimary ?? DEFAULT_LIGHT_MODE_CONFIG.accentPrimary,
                background: writeShape.background ?? DEFAULT_LIGHT_MODE_CONFIG.background,
                logo: docsConfig.logoV2?.light,
            };
        case "darkAndLight":
            return {
                type: "darkAndLight",
                light: {
                    accentPrimary: writeShape.light.accentPrimary ?? DEFAULT_LIGHT_MODE_CONFIG.accentPrimary,
                    background: writeShape.light.background ?? DEFAULT_LIGHT_MODE_CONFIG.background,
                    logo: docsConfig.logoV2?.light,
                },
                dark: {
                    accentPrimary: writeShape.dark.accentPrimary ?? DEFAULT_DARK_MODE_CONFIG.accentPrimary,
                    background: writeShape.dark.background ?? DEFAULT_DARK_MODE_CONFIG.background,
                    logo: docsConfig.logoV2?.dark ?? docsConfig.logo,
                },
            };
        default:
            assertNever(writeShape);
    }
}
