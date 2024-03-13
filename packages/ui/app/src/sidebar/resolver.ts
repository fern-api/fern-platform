import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isSubpackage } from "../util/fern";
import { titleCase } from "../util/titleCase";
import { SidebarNodeRaw } from "./types";

function resolveSidebarNodeRawApiSection(
    api: FdrAPI.ApiId,
    id: string,
    package_: APIV1Read.ApiDefinitionPackage | undefined,
    title: string,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    showErrors: boolean,
    parentSlugs: string[],
): SidebarNodeRaw.ApiSection | undefined {
    let subpackage: APIV1Read.ApiDefinitionPackage | undefined = package_;
    while (subpackage?.pointsTo != null) {
        subpackage = subpackagesMap[subpackage.pointsTo];
    }
    if (subpackage == null) {
        return;
    }
    // the parentSlug comes from the parent package, ignoring all pointsTo rewriting
    const slug = package_ != null && isSubpackage(package_) ? [...parentSlugs, package_.urlSlug] : parentSlugs;
    const endpoints = subpackage.endpoints.map(
        (endpoint): SidebarNodeRaw.EndpointPage => ({
            type: "page",
            api,
            id: endpoint.id,
            slug: [...slug, endpoint.urlSlug],
            title: endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
            description: endpoint.description,
            method: endpoint.method,
            stream: endpoint.response?.type.type === "stream",
        }),
    );
    const websockets = subpackage.websockets.map(
        (websocket): SidebarNodeRaw.ApiPage => ({
            type: "page",
            api,
            id: websocket.id,
            slug: [...slug, websocket.urlSlug],
            title: websocket.name != null ? websocket.name : stringifyEndpointPathParts(websocket.path.parts),
            description: websocket.description,
        }),
    );
    const webhooks = subpackage.webhooks.map(
        (webhook): SidebarNodeRaw.ApiPage => ({
            type: "page",
            api,
            id: webhook.id,
            slug: [...slug, webhook.urlSlug],
            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
            description: webhook.description,
        }),
    );
    const subpackages = subpackage.subpackages
        .map((innerSubpackageId) =>
            resolveSidebarNodeRawApiSection(
                api,
                innerSubpackageId,
                subpackagesMap[innerSubpackageId],
                titleCase(subpackagesMap[innerSubpackageId]?.name ?? ""),
                subpackagesMap,
                showErrors,
                slug,
            ),
        )
        .filter((subpackage) => subpackage != null) as SidebarNodeRaw.ApiSection[];

    if (endpoints.length === 0 && websockets.length === 0 && webhooks.length === 0 && subpackages.length === 0) {
        return;
    }

    return {
        type: "apiSection",
        api,
        id,
        title,
        slug,
        endpoints,
        webhooks,
        websockets,
        subpackages,
        showErrors,
        artifacts: undefined,
        changelog: undefined,
    };
}

function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return "/" + path.map((part) => (part.type === "literal" ? part.value : `${part.value}`)).join("/");
}

export function resolveSidebarNodes(
    navigationItems: DocsV1Read.NavigationItem[],
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: string[] = [],
): SidebarNodeRaw[] {
    const SidebarNodeRaws: SidebarNodeRaw[] = [];
    for (const navigationItem of navigationItems) {
        visitDiscriminatedUnion(navigationItem, "type")._visit<void>({
            page: (page) => {
                const lastSidebarNodeRaw = SidebarNodeRaws[SidebarNodeRaws.length - 1];
                if (lastSidebarNodeRaw != null && lastSidebarNodeRaw.type === "pageGroup") {
                    lastSidebarNodeRaw.pages.push({
                        ...page,
                        slug: page.fullSlug ?? [...parentSlugs, page.urlSlug],
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
                                slug: page.fullSlug ?? [...parentSlugs, page.urlSlug],
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
                        api.fullSlug ?? (api.skipUrlSlug ? parentSlugs : [...parentSlugs, api.urlSlug]);
                    const resolved = resolveSidebarNodeRawApiSection(
                        api.api,
                        api.api,
                        definition.rootPackage,
                        api.title,
                        definition.subpackages,
                        api.showErrors,
                        definitionSlug,
                    );
                    SidebarNodeRaws.push({
                        type: "apiSection",
                        api: api.api,
                        id: api.api,
                        title: api.title,
                        slug: definitionSlug,
                        endpoints: resolved?.endpoints ?? [],
                        webhooks: resolved?.webhooks ?? [],
                        websockets: resolved?.websockets ?? [],
                        subpackages: resolved?.subpackages ?? [],
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
                                      slug: api.changelog.fullSlug ?? [...definitionSlug, api.changelog.urlSlug],
                                      items: api.changelog.items.map((item) => ({
                                          date: item.date,
                                          pageId: item.pageId,
                                      })),
                                  }
                                : undefined,
                    });
                }
            },
            section: (section) => {
                const sectionSlug =
                    section.fullSlug ?? (section.skipUrlSlug ? parentSlugs : [...parentSlugs, section.urlSlug]);
                SidebarNodeRaws.push({
                    type: "section",
                    title: section.title,
                    slug: sectionSlug,
                    // if section.fullSlug is defined, the child slugs will be built from that, rather than from inherited parentSlugs
                    items: resolveSidebarNodes(section.items, apis, sectionSlug),
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
