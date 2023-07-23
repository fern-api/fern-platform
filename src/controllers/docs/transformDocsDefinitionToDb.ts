import { kebabCase } from "lodash";
import { FernRegistry } from "../../generated";
import * as FernRegistryDocsDb from "../../generated/api/resources/docs/resources/v1/resources/db";
import * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
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
    const navigationConfig: FernRegistryDocsRead.NavigationConfig = {
        items: writeShape.config.navigation.items.map((item) => transformNavigationItemForReading(item)),
    };
    const transformedFiles: Record<FileId, FernRegistryDocsDb.DbFileInfo> = {};
    Object.entries(files).forEach(([, s3FileInfo]) => {
        transformedFiles[s3FileInfo.presignedUrl.fileId] = {
            s3Key: s3FileInfo.key,
        };
    });
    return {
        type: "v2",
        referencedApis: getReferencedApiDefinitionIds(navigationConfig),
        files: transformedFiles,
        config: {
            navigation: navigationConfig,
            logo: writeShape.config.logo,
            logoHref: writeShape.config.logoHref,
            colors: writeShape.config.colors,
            navbarLinks: (writeShape.config.navbarLinks ?? []).map((link) => transformNavbarLinkForReading(link)),
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
                urlSlug: kebabCase(writeShape.title),
            };
        case "section":
            return {
                type: "section",
                title: writeShape.title,
                urlSlug: kebabCase(writeShape.title),
                items: writeShape.items.map((item) => transformNavigationItemForReading(item)),
            };
    }
}

export function getReferencedApiDefinitionIds(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): FernRegistry.ApiDefinitionId[] {
    return navigationConfig.items.flatMap((item) => getReferencedApiDefinitionIdFromItem(item));
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

function transformNavbarLinkForReading(
    writeShape: FernRegistry.docs.v1.write.NavbarLink
): WithoutQuestionMarks<FernRegistry.docs.v1.read.NavbarLink> {
    let linkType: FernRegistry.docs.v1.read.LinkType = { type: "generic" };
    if (writeShape.url.includes("github")) {
        linkType = { type: "github" };
    } else if (writeShape.url.includes("discord")) {
        linkType = { type: "discord" };
    } else if (writeShape.url.includes("twitter")) {
        linkType = { type: "twitter" };
    }
    return {
        style: writeShape.style ?? "DEFAULT",
        text: writeShape.text,
        url: writeShape.url,
        linkType,
    };
}
