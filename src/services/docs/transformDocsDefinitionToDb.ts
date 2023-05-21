import { kebabCase } from "lodash";
import { S3FileInfo } from "../../S3Utils";
import { FernRegistry } from "../../generated";
import * as FernRegistryDocsRead from "../../generated/api/resources/docs/resources/v1/resources/read";
import { FileId, FilePath } from "../../generated/api/resources/docs/resources/v1/resources/write";

export function transformWriteDocsDefinitionToDb({
    writeShape,
    files,
}: {
    writeShape: FernRegistry.docs.v1.write.DocsDefinition;
    files: Record<FilePath, S3FileInfo>;
}): FernRegistry.docs.v1.read.DocsDefinitionDb {
    const navigationConfig: FernRegistryDocsRead.NavigationConfig = {
        items: writeShape.config.navigation.items.map((item) => transformNavigationItemForReading(item)),
    };
    const transformedFiles: Record<FileId, FernRegistryDocsRead.DbFileInfo> = {};
    Object.entries(files).forEach(([, s3FileInfo]) => {
        transformedFiles[s3FileInfo.presignedUrl.fileId] = {
            s3Key: s3FileInfo.key,
        };
    });
    return {
        ...writeShape,
        referencedApis: new Set(getReferencedApiDefinitionIds(navigationConfig)),
        files: transformedFiles,
        config: {
            ...writeShape.config,
            navigation: navigationConfig,
        },
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
