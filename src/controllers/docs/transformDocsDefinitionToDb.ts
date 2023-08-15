import { kebabCase } from "lodash";
import { FernRegistry } from "../../generated";
import * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
import * as FernRegistryDocsWrite from "../../generated/api/resources/docs/resources/v1/resources/write";
import { FileId, FilePath } from "../../generated/api/resources/docs/resources/v1/resources/write";
import { type S3FileInfo } from "../../services/s3";
import { type WithoutQuestionMarks } from "../../util";

export function transformWriteDocsDefinitionToDb({
    writeShape,
    files,
}: {
    writeShape: FernRegistry.docs.v1.write.DocsDefinition;
    files: Record<FilePath, S3FileInfo>;
}): WithoutQuestionMarks<FernRegistry.docs.v1.db.DocsDefinitionDb.V2> {
    const navigationConfig: FernRegistryDocsRead.NavigationConfig = transformNavigationConfigForReading(
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

export function transformNavigationConfigForReading(
    writeShape: FernRegistryDocsWrite.NavigationConfig
): FernRegistryDocsRead.NavigationConfig {
    if (isUnversionedWriteConfig(writeShape)) {
        return {
            items: writeShape.items.map((item) => transformNavigationItemForReading(item)),
        };
    } else if (isVersionedWriteConfig(writeShape)) {
        return {
            versions: writeShape.versions.map((version) => {
                return {
                    config: {
                        items: version.config.items.map((item) => transformNavigationItemForReading(item)),
                    },
                    version: version.version,
                };
            }),
        };
    }
    throw new Error("navigationConfig is neither unversioned or versioned");
}

export function transformNavigationItemForReading(
    writeShape: FernRegistry.docs.v1.write.NavigationItem
): FernRegistry.docs.v1.read.NavigationItem {
    switch (writeShape.type) {
        case "api":
            return {
                ...writeShape,
                urlSlug: kebabCase(writeShape.title),
                artifacts:
                    writeShape.artifacts != null ? transformArtifactsForReading(writeShape.artifacts) : undefined,
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
                items: writeShape.items.map((item) => transformNavigationItemForReading(item)),
            };
    }
}

export function getReferencedApiDefinitionIds(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): FernRegistry.ApiDefinitionId[] {
    if (isUnversionedReadConfig(navigationConfig)) {
        return navigationConfig.items.flatMap((item) => getReferencedApiDefinitionIdFromItem(item));
    } else if (isVersionedReadConfig(navigationConfig)) {
        return navigationConfig.versions.flatMap((version) =>
            version.config.items.flatMap((item) => getReferencedApiDefinitionIdFromItem(item))
        );
    }
    throw new Error("navigationConfig is neither unversioned or versioned");
}

function getReferencedApiDefinitionIdFromItem(
    item: FernRegistryDocsRead.NavigationItem
): FernRegistry.ApiDefinitionId[] {
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

function isVersionedWriteConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.VersionedNavigationConfig {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (navigationConfig as FernRegistryDocsWrite.VersionedNavigationConfig).versions !== undefined;
}

function isUnversionedWriteConfig(
    navigationConfig: FernRegistryDocsWrite.NavigationConfig
): navigationConfig is FernRegistryDocsWrite.UnversionedNavigationConfig {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (navigationConfig as FernRegistryDocsWrite.UnversionedNavigationConfig).items !== undefined;
}

function isVersionedReadConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.VersionedNavigationConfig {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (navigationConfig as FernRegistryDocsRead.VersionedNavigationConfig).versions !== undefined;
}

function isUnversionedReadConfig(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): navigationConfig is FernRegistryDocsRead.UnversionedNavigationConfig {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (navigationConfig as FernRegistryDocsRead.UnversionedNavigationConfig).items !== undefined;
}
