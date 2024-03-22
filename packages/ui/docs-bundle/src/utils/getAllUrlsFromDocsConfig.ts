import { APIV1Read, DocsV1Read } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import {
    buildUrl,
    isUnversionedTabbedNavigationConfig,
    isVersionedNavigationConfig,
    resolveSidebarNodes,
    SidebarNodeRaw,
} from "@fern-ui/ui";

export async function getAllUrlsFromDocsConfig(
    host: string,
    basePath: string | undefined,
    docsConfig: DocsV1Read.DocsConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): Promise<string[]> {
    const flattenedNavigationConfig = flattenNavigationConfig(
        docsConfig.navigation,
        basePath != null
            ? basePath
                  .split("/")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
            : [],
    );

    const sidebarNodes = flattenedNavigationConfig.flatMap(({ slug, items }) => resolveSidebarNodes(items, apis, slug));

    const ROOT_NODE = { slug: basePath == null ? [] : basePath.split("/").filter((t) => t.length > 0) };
    const flattenedSidebarNodes = [ROOT_NODE, ...flattenSidebarNodeSlugs(sidebarNodes)];

    return Array.from(new Set(flattenedSidebarNodes.map((node) => buildUrl({ host, pathname: node.slug.join("/") }))));
}

interface FlattenedNavigationConfig {
    slug: string[];
    items: DocsV1Read.NavigationItem[];
}

function flattenNavigationConfig(nav: DocsV1Read.NavigationConfig, parentSlugs: string[]): FlattenedNavigationConfig[] {
    if (isVersionedNavigationConfig(nav)) {
        return nav.versions.flatMap((version, idx) =>
            idx === 0
                ? [
                      ...flattenNavigationConfig(version.config, [...parentSlugs]), // default version
                      ...flattenNavigationConfig(version.config, [...parentSlugs, ...version.urlSlug.split("/")]),
                  ]
                : flattenNavigationConfig(version.config, [...parentSlugs, ...version.urlSlug.split("/")]),
        );
    }

    if (isUnversionedTabbedNavigationConfig(nav)) {
        return nav.tabs.map((tab) => ({ slug: [...parentSlugs, ...tab.urlSlug.split("/")], items: tab.items }));
    }

    return [{ slug: parentSlugs, items: nav.items }];
}

function flattenSidebarNodeSlugs(nodes: SidebarNodeRaw[]): { slug: string[] }[] {
    return nodes.flatMap((node) => {
        if (node.type === "pageGroup") {
            return [{ slug: node.slug }, ...node.pages.filter(SidebarNodeRaw.isPage)];
        } else if (node.type === "section") {
            return [{ slug: node.slug }, ...flattenSidebarNodeSlugs(node.items)];
        } else if (node.type === "apiSection") {
            const current = [...node.items, node.changelog].filter(isNonNullish);
            return [
                { slug: node.slug },
                ...current,
                ...flattenSidebarNodeSlugs(node.items.filter(SidebarNodeRaw.isSubpackageSection)),
            ];
        }
        return [];
    });
}
