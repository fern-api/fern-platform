import { kebabCase } from "lodash";
import path from "path";
import { FernRegistry } from "../generated";
import * as FernRegistryDocsRead from "../generated/api/resources/docs/resources/v1/resources/read";

export function transformWriteDocsDefinitionToDb(
    writeShape: FernRegistry.docs.v1.write.DocsDefinition
): FernRegistry.docs.v1.read.DocsDefinitionDb {
    const navigationConfig: FernRegistryDocsRead.NavigationConfig = {
        items: writeShape.config.navigation.items.map((item) => transformNavigationItemForReading(item)),
    };
    return {
        ...writeShape,
        referencedApis: new Set(...getReferencedApiDefinitionIds(navigationConfig)),
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
            writeShape.title; // kebab case of title
            return {
                ...writeShape,
                urlSlug: "",
            };
        case "page":
            return {
                type: "page",
                id: writeShape.value,
                urlSlug: path.basename(writeShape.value, ".md"), // remove extension
            };
        case "section":
            writeShape.title; // kebab case of title
            return {
                type: "section",
                title: writeShape.title,
                urlSlug: kebabCase(writeShape.title),
                items: writeShape.items.map((item) => transformNavigationItemForReading(item)),
            };
    }
}

function getReferencedApiDefinitionIds(
    navigationConfig: FernRegistryDocsRead.NavigationConfig
): FernRegistry.ApiDefinitionId[] {
    return navigationConfig.items.flatMap((item) => getReferencedApiDefinitionIdFromItem(item));
}

function getReferencedApiDefinitionIdFromItem(
    item: FernRegistryDocsRead.NavigationItem
): FernRegistry.ApiDefinitionId[] {
    switch (item.type) {
        case "api":
            return [...item.api];
        case "page":
            return [];
        case "section":
            return item.items.flatMap((sectionItem) => getReferencedApiDefinitionIdFromItem(sectionItem));
    }
}
