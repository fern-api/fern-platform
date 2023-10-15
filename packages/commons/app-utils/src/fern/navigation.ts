import type * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { assertNeverNoThrow } from "@fern-ui/core-utils";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "./docs";

export function getFirstNavigatableItemSlugInDefinition(
    definition: FernRegistryDocsRead.DocsDefinition
): string | undefined {
    const { navigation: navigationConfig } = definition.config;
    let unversionedConfig;

    if (isVersionedNavigationConfig(navigationConfig)) {
        const [defaultVersionConfigData] = navigationConfig.versions;
        if (defaultVersionConfigData == null) {
            return undefined;
        }
        unversionedConfig = defaultVersionConfigData.config;
    } else {
        unversionedConfig = navigationConfig;
    }

    if (isUnversionedTabbedNavigationConfig(unversionedConfig)) {
        const [firstTab] = unversionedConfig.tabs;
        if (firstTab == null) {
            return undefined;
        }
        const [firstItem] = firstTab.items;
        if (firstItem == null) {
            return undefined;
        }
        return getFirstNavigatableItem(firstItem, firstTab.urlSlug);
    } else {
        const [firstItem] = unversionedConfig.items;
        if (firstItem == null) {
            return undefined;
        }
        return getFirstNavigatableItem(firstItem);
    }
}

export function getFirstNavigatableItem(
    item: FernRegistryDocsRead.NavigationItem,
    slugPrefix?: string
): string | undefined {
    switch (item.type) {
        case "api":
        case "page": {
            const parts: string[] = [];
            if (slugPrefix != null) {
                parts.push(slugPrefix);
            }
            parts.push(item.urlSlug);
            return parts.join("/");
        }
        case "section": {
            const section = item;
            const [firstChildItem] = section.items;
            if (firstChildItem == null) {
                return undefined;
            }
            const parts: string[] = [];
            if (slugPrefix != null) {
                parts.push(slugPrefix);
            }
            parts.push(section.urlSlug);
            return getFirstNavigatableItem(firstChildItem, parts.join("/"));
        }
        default:
            assertNeverNoThrow(item);
    }

    return undefined;
}
