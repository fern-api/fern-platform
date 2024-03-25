import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, titleCase, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isUnversionedTabbedNavigationConfig, isVersionedNavigationConfig } from "./docs";
import { isSubpackage } from "./subpackage";
import { SidebarNodeRaw } from "./types";

function toApiType(apiType: APIV1Read.ApiNavigationConfigItem["type"]): SidebarNodeRaw.ApiPageOrSubpackage["apiType"] {
    switch (apiType) {
        case "endpointId":
            return "endpoint";
        case "websocketId":
            return "websocket";
        case "webhookId":
            return "webhook";
        case "subpackage":
            return "subpackage";
    }
}

function resolveSidebarNodeRawApiSection(
    api: FdrAPI.ApiId,
    id: string,
    package_: APIV1Read.ApiDefinitionPackage | undefined,
    title: string,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    showErrors: boolean,
    parentSlugs: readonly string[],
    navigation: APIV1Read.ApiNavigationConfigRoot | APIV1Read.ApiNavigationConfigSubpackage | undefined,
): SidebarNodeRaw.ApiSection | undefined {
    let subpackage: APIV1Read.ApiDefinitionPackage | undefined = package_;
    while (subpackage?.pointsTo != null) {
        subpackage = subpackagesMap[subpackage.pointsTo];
    }
    if (subpackage == null) {
        return;
    }
    // the parentSlug comes from the parent package, ignoring all pointsTo rewriting
    const slug =
        package_ != null && isSubpackage(package_) ? [...parentSlugs, ...package_.urlSlug.split("/")] : parentSlugs;
    const endpoints = subpackage.endpoints.map(
        (endpoint): SidebarNodeRaw.EndpointPage => ({
            type: "page",
            apiType: "endpoint",
            api,
            id: endpoint.id,
            slug: [...slug, ...endpoint.urlSlug.split("/")],
            title: endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
            description: endpoint.description,
            method: endpoint.method,
            stream: endpoint.response?.type.type === "stream",
        }),
    );
    const websockets = subpackage.websockets.map(
        (websocket): SidebarNodeRaw.WebSocketPage => ({
            type: "page",
            apiType: "websocket",
            api,
            id: websocket.id,
            slug: [...slug, ...websocket.urlSlug.split("/")],
            title: websocket.name != null ? websocket.name : stringifyEndpointPathParts(websocket.path.parts),
            description: websocket.description,
        }),
    );
    const webhooks = subpackage.webhooks.map(
        (webhook): SidebarNodeRaw.WebhookPage => ({
            type: "page",
            apiType: "webhook",
            api,
            id: webhook.id,
            slug: [...slug, ...webhook.urlSlug.split("/")],
            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
            description: webhook.description,
        }),
    );

    const subpackages = subpackage.subpackages
        .map((innerSubpackageId): SidebarNodeRaw.SubpackageSection | undefined => {
            const resolvedSubpackage = resolveSidebarNodeRawApiSection(
                api,
                innerSubpackageId,
                subpackagesMap[innerSubpackageId],
                titleCase(subpackagesMap[innerSubpackageId]?.name ?? ""),
                subpackagesMap,
                showErrors,
                slug,
                navigation?.items
                    .filter((item): item is APIV1Read.ApiNavigationConfigItem.Subpackage => item.type === "subpackage")
                    .find((item) => item.subpackageId === innerSubpackageId),
            );
            if (resolvedSubpackage == null) {
                return undefined;
            }
            return { ...resolvedSubpackage, apiType: "subpackage" };
        })
        .filter(isNonNullish);

    // default sort
    const items: SidebarNodeRaw.ApiPageOrSubpackage[] = [...endpoints, ...websockets, ...webhooks, ...subpackages];

    if (navigation?.items != null) {
        items.sort((a, b) => {
            const aIndex = navigation.items.findIndex(
                (item) =>
                    toApiType(item.type) === a.apiType &&
                    (item.type === "subpackage" ? item.subpackageId === a.id : item.value === a.id),
            );
            const bIndex = navigation.items.findIndex(
                (item) =>
                    toApiType(item.type) === b.apiType &&
                    (item.type === "subpackage" ? item.subpackageId === b.id : item.value === b.id),
            );

            if (aIndex === -1) {
                return 1;
            }
            if (bIndex === -1) {
                return -1;
            }
            return aIndex - bIndex;
        });
    }

    if (items.length === 0) {
        return;
    }

    return {
        type: "apiSection",
        api,
        id,
        title,
        slug,
        items,
        showErrors,
        artifacts: undefined,
        changelog: undefined,
        description: undefined, // TODO: add description here
    };
}

function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return "/" + path.map((part) => (part.type === "literal" ? part.value : `${part.value}`)).join("/");
}

export function resolveSidebarNodesRoot(
    nav: DocsV1Read.NavigationConfig,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    basePath: string | undefined,
): SidebarNodeRaw.Root {
    const basePathSlug = basePath != null ? basePath.split("/").filter((t) => t.length > 0) : [];

    return {
        type: "root",
        slug: basePathSlug,
        items: resolveSidebarNodesRootItems(nav, apis, basePathSlug),
    };
}

function resolveSidebarNodesRootItems(
    nav: DocsV1Read.NavigationConfig,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: readonly string[],
): SidebarNodeRaw.Root["items"] {
    if (isVersionedNavigationConfig(nav)) {
        const toRet: SidebarNodeRaw.VersionGroup[] = [];
        nav.versions.forEach((version, index) => {
            // default version
            if (index === 0) {
                toRet.push({
                    type: "versionGroup",
                    id: version.version,
                    slug: parentSlugs,
                    index,
                    availability: version.availability ?? null,
                    items: resolveSidebarNodesVersionItems(version.config, apis, parentSlugs),
                });
            }

            const versionSlug = [...parentSlugs, ...version.urlSlug.split("/")];
            toRet.push({
                type: "versionGroup",
                id: version.version,
                slug: versionSlug,
                index,
                availability: version.availability ?? null,
                items: resolveSidebarNodesVersionItems(version.config, apis, versionSlug),
            });
        });

        return toRet;
    }

    return resolveSidebarNodesVersionItems(nav, apis, parentSlugs);
}

function resolveSidebarNodesVersionItems(
    nav: DocsV1Read.UnversionedNavigationConfig,
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: readonly string[],
): SidebarNodeRaw.VersionGroup["items"] {
    if (isUnversionedTabbedNavigationConfig(nav)) {
        return nav.tabs.map((tab): SidebarNodeRaw.TabGroup => {
            const tabSlug = [...parentSlugs, ...tab.urlSlug.split("/")];
            return {
                type: "tabGroup",
                title: tab.title,
                icon: tab.icon,
                slug: tabSlug,
                items: resolveSidebarNodes(tab.items, apis, tabSlug, parentSlugs),
            };
        });
    }

    return resolveSidebarNodes(nav.items, apis, parentSlugs, parentSlugs);
}

export function resolveSidebarNodes(
    navigationItems: DocsV1Read.NavigationItem[],
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: readonly string[], // parent slugs that are inherited from the parent node
    fixedSlugs: readonly string[], // basepath and version slugs
): SidebarNodeRaw[] {
    const SidebarNodeRaws: SidebarNodeRaw[] = [];
    for (const navigationItem of navigationItems) {
        visitDiscriminatedUnion(navigationItem, "type")._visit<void>({
            page: (page) => {
                const lastSidebarNodeRaw = SidebarNodeRaws[SidebarNodeRaws.length - 1];
                if (lastSidebarNodeRaw != null && lastSidebarNodeRaw.type === "pageGroup") {
                    lastSidebarNodeRaw.pages.push({
                        ...page,
                        slug:
                            page.fullSlug != null
                                ? [...fixedSlugs, ...page.fullSlug]
                                : [...parentSlugs, ...page.urlSlug.split("/")],
                        type: "page",
                        description: undefined,
                    });
                } else {
                    SidebarNodeRaws.push({
                        type: "pageGroup",
                        slug: parentSlugs,
                        pages: [
                            {
                                ...page,
                                slug:
                                    page.fullSlug != null
                                        ? [...fixedSlugs, ...page.fullSlug]
                                        : [...parentSlugs, ...page.urlSlug.split("/")],
                                type: "page",
                                description: undefined,
                            },
                        ],
                    });
                }
            },
            api: async (api) => {
                const definition = apis[api.api];
                if (definition != null) {
                    const definitionSlug =
                        api.fullSlug != null
                            ? [...fixedSlugs, ...api.fullSlug]
                            : api.skipUrlSlug
                              ? parentSlugs
                              : [...parentSlugs, ...api.urlSlug.split("/")];
                    const resolved = resolveSidebarNodeRawApiSection(
                        api.api,
                        api.api,
                        definition.rootPackage,
                        api.title,
                        definition.subpackages,
                        api.showErrors,
                        definitionSlug,
                        definition.navigation,
                    );
                    SidebarNodeRaws.push({
                        type: "apiSection",
                        api: api.api,
                        id: api.api,
                        title: api.title,
                        slug: definitionSlug,
                        items: resolved?.items ?? [],
                        artifacts: api.artifacts,
                        showErrors: api.showErrors,
                        changelog:
                            api.changelog != null
                                ? {
                                      type: "page",
                                      pageType: "changelog",
                                      id: api.changelog.urlSlug,
                                      title: api.changelog.title ?? "Changelog",
                                      description: api.changelog.description,
                                      pageId: api.changelog.pageId,
                                      slug:
                                          api.changelog.fullSlug != null
                                              ? [...fixedSlugs, ...api.changelog.fullSlug]
                                              : [...definitionSlug, ...api.changelog.urlSlug.split("/")],
                                      items: api.changelog.items.map((item) => ({
                                          date: item.date,
                                          pageId: item.pageId,
                                      })),
                                  }
                                : undefined,
                        description: undefined, // TODO: add description here
                    });
                }
            },
            section: (section) => {
                const sectionSlug =
                    section.fullSlug != null
                        ? [...fixedSlugs, ...section.fullSlug]
                        : section.skipUrlSlug
                          ? parentSlugs
                          : [...parentSlugs, ...section.urlSlug.split("/")];
                SidebarNodeRaws.push({
                    type: "section",
                    title: section.title,
                    slug: sectionSlug,
                    // if section.fullSlug is defined, the child slugs will be built from that, rather than from inherited parentSlugs
                    items: resolveSidebarNodes(section.items, apis, sectionSlug, fixedSlugs),
                });
            },
            link: (link) => {
                const lastSidebarNodeRaw = SidebarNodeRaws[SidebarNodeRaws.length - 1];
                if (lastSidebarNodeRaw != null && lastSidebarNodeRaw.type === "pageGroup") {
                    lastSidebarNodeRaw.pages.push(link);
                } else {
                    SidebarNodeRaws.push({
                        type: "pageGroup",
                        slug: parentSlugs,
                        pages: [link],
                    });
                }
            },
            _other: () => Promise.resolve(),
        });
    }

    return SidebarNodeRaws;
}
