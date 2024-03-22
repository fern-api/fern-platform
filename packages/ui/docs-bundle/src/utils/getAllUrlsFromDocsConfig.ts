import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";
import {
    buildUrl,
    isUnversionedTabbedNavigationConfig,
    isVersionedNavigationConfig,
    resolveSidebarNodes,
    serializeSidebarNodeDescriptionMdx,
    SidebarNavigation,
    SidebarNodeRaw,
    SidebarTab,
    SidebarVersionInfo,
} from "@fern-ui/ui";

export async function getAllUrlsFromDocsConfig(
    host: string,
    basePath: string | undefined,
    docsConfig: DocsV1Read.DocsConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): Promise<string[]> {
    const enumeratedPaths = await enumerateAllSlugsFromDocsConfig(basePath, docsConfig.navigation, apis);

    const paths = enumeratedPaths.map(({ slug }) => buildUrl({ host, pathname: slug.join("/") }));

    return [...paths];
}

interface FlattenedNavigationConfig {
    slug: readonly string[]; // the full slug of an item

    // everything below is meant to indicate where the item is in the navigation tree
    parentSlug: readonly string[]; // the slug containing basepath, version, tab
    items: DocsV1Read.NavigationItem[];
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionIndex: number | undefined;
    versions: SidebarVersionInfo[];
}

export async function enumerateAllSlugsFromDocsConfig(
    basePath: string | undefined,
    nav: DocsV1Read.NavigationConfig,
    apis: Record<string, APIV1Read.ApiDefinition>,
): Promise<FlattenedNavigationConfig[]> {
    const flattenedNavigationConfig = flattenNavigationConfig(
        nav,
        basePath != null
            ? basePath
                  .split("/")
                  .map((t) => t.trim())
                  .filter((t) => t.length > 0)
            : [],
    );

    const sidebarNodes = flattenedNavigationConfig.flatMap((config) =>
        resolveSidebarNodes(config.items, apis, config.parentSlug).map((node) => ({ node, config })),
    );
    return flattenSidebarNodeSlugs(sidebarNodes);
}

export async function getNavigationRoot(
    slugArray: string[],
    basePath: string | undefined,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    nav: DocsV1Read.NavigationConfig,
): Promise<SidebarNavigation | undefined> {
    const enumeratedPaths = await enumerateAllSlugsFromDocsConfig(basePath, nav, apis);

    const foundPaths = enumeratedPaths.filter((path) => path.slug.join("/") === slugArray.join("/"));

    if (foundPaths.length === 0) {
        return undefined;
    }

    if (foundPaths.length > 1) {
        // eslint-disable-next-line no-console
        console.error("Found multiple paths for the same slug", slugArray, foundPaths);
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const foundPath = foundPaths[0]!;

    const rawSidebarNodes = resolveSidebarNodes(foundPath.items, apis, foundPath.parentSlug);
    const sidebarNodes = await Promise.all(rawSidebarNodes.map((node) => serializeSidebarNodeDescriptionMdx(node)));

    return {
        slug: foundPath.parentSlug,
        sidebarNodes,
        currentTabIndex: foundPath.currentTabIndex,
        tabs: foundPath.tabs,
        currentVersionIndex: foundPath.currentVersionIndex,
        versions: foundPath.versions,
    };
}

function flattenNavigationConfig(
    nav: DocsV1Read.NavigationConfig,
    parentSlug: string[],
    config?: Partial<Omit<FlattenedNavigationConfig, "slug" | "items">>,
): Omit<FlattenedNavigationConfig, "slug">[] {
    if (isVersionedNavigationConfig(nav)) {
        const versionsZeroConfig = {
            versions: nav.versions.map((version, idx) => ({
                id: version.version,
                index: idx,
                availability: version.availability ?? null,
                slug: parentSlug,
            })),
            ...config,
        };
        const versionsConfig = {
            versions: nav.versions.map((version, idx) => ({
                id: version.version,
                index: idx,
                availability: version.availability ?? null,
                slug: [...parentSlug, ...version.urlSlug.split("/")],
            })),
            ...config,
        };
        return nav.versions.flatMap((version, idx) =>
            idx === 0
                ? [
                      ...flattenNavigationConfig(version.config, [...parentSlug], {
                          currentVersionIndex: idx,
                          ...versionsZeroConfig,
                      }), // default version
                      ...flattenNavigationConfig(version.config, [...parentSlug, ...version.urlSlug.split("/")], {
                          currentVersionIndex: idx,
                          ...versionsConfig,
                      }),
                  ]
                : flattenNavigationConfig(version.config, [...parentSlug, ...version.urlSlug.split("/")], {
                      currentVersionIndex: idx,
                      ...versionsConfig,
                  }),
        );
    }

    if (isUnversionedTabbedNavigationConfig(nav)) {
        const tabs = nav.tabs.map((tab) => ({
            title: tab.title,
            icon: tab.icon,
            slug: [...parentSlug, ...tab.urlSlug.split("/")],
        }));
        return nav.tabs.map((tab, i) => ({
            versions: [],
            currentVersionIndex: undefined,
            ...config,
            parentSlug: [...parentSlug, ...tab.urlSlug.split("/")],
            tabs,
            currentTabIndex: i,
            items: tab.items,
        }));
    }

    return [
        {
            versions: [],
            currentVersionIndex: undefined,
            tabs: [],
            currentTabIndex: undefined,
            ...config,
            parentSlug,
            items: nav.items,
        },
    ];
}

function flattenSidebarNodeSlugs(
    nodes: {
        node: SidebarNodeRaw;
        config: Omit<FlattenedNavigationConfig, "slug">;
    }[],
): FlattenedNavigationConfig[] {
    return nodes.flatMap((node): FlattenedNavigationConfig[] => {
        if (node.node.type === "pageGroup") {
            return [
                { ...node.config, slug: node.node.slug },
                ...node.node.pages.filter(SidebarNodeRaw.isPage).map((page) => ({ ...node.config, slug: page.slug })),
            ];
        } else if (node.node.type === "section") {
            return [
                { ...node.config, slug: node.node.slug },
                ...flattenSidebarNodeSlugs(node.node.items.map((item) => ({ config: node.config, node: item }))),
            ];
        } else if (node.node.type === "apiSection") {
            const current = [...node.node.items, node.node.changelog]
                .filter(isNonNullish)
                .map((item) => ({ ...node.config, slug: item.slug }));
            return [
                { ...node.config, slug: node.node.slug },
                ...current,
                ...flattenSidebarNodeSlugs(
                    node.node.items
                        .filter(SidebarNodeRaw.isSubpackageSection)
                        .map((item) => ({ config: node.config, node: item })),
                ),
            ];
        }
        return [];
    });
}
