import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last, noop, sortBy } from "lodash-es";
import { titleCase } from "../util/titleCase";

export type SidebarNode = SidebarNode.PageGroup | SidebarNode.ApiSection | SidebarNode.Section;

export declare namespace SidebarNode {
    export interface PageGroup {
        type: "pageGroup";
        pages: (SidebarNode.Page | SidebarNode.Link)[];
    }

    export interface ApiSection {
        type: "apiSection";
        api: FdrAPI.ApiId;
        id: string;
        title: string;
        slug: string[];
        endpoints: SidebarNode.EndpointPage[];
        webhooks: SidebarNode.Page[];
        websockets: SidebarNode.Page[];
        subpackages: SidebarNode.ApiSection[];
        artifacts: DocsV1Read.ApiArtifacts | null;
    }

    export interface Section {
        type: "section";
        title: string;
        slug: string[];
        items: SidebarNode[];
    }

    export interface Page {
        type: "page";
        id: string;
        slug: string[];
        title: string;
        description?: string;
    }

    export interface Link {
        type: "link";
        title: string;
        url: string;
    }

    export interface EndpointPage extends Page {
        method: APIV1Read.HttpMethod;
        stream?: boolean;
    }
}

function resolveSidebarNodeApiSection(
    api: FdrAPI.ApiId,
    subpackageId: APIV1Read.SubpackageId,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: string[],
): SidebarNode.ApiSection | undefined {
    const subpackage = subpackagesMap[subpackageId];
    if (subpackage == null) {
        return;
    }
    const slug = [...parentSlugs, subpackage.urlSlug];
    const endpoints = subpackage.endpoints.map(
        (endpoint): SidebarNode.EndpointPage => ({
            type: "page",
            id: endpoint.id,
            slug: [...slug, endpoint.urlSlug],
            title: endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
            description: endpoint.description,
            method: endpoint.method,
            stream: endpoint.response?.type.type === "stream",
        }),
    );
    const websockets = subpackage.websockets.map(
        (websocket): SidebarNode.Page => ({
            type: "page",
            id: websocket.id,
            slug: [...slug, websocket.urlSlug],
            title: websocket.name != null ? websocket.name : stringifyEndpointPathParts(websocket.path.parts),
            description: websocket.description,
        }),
    );
    const webhooks = subpackage.webhooks.map(
        (webhook): SidebarNode.Page => ({
            type: "page",
            id: webhook.id,
            slug: [...slug, webhook.urlSlug],
            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
            description: webhook.description,
        }),
    );
    const subpackages = subpackage.subpackages
        .map((innerSubpackageId) => resolveSidebarNodeApiSection(api, innerSubpackageId, subpackagesMap, slug))
        .filter(isNonNullish);

    if (endpoints.length === 0 && webhooks.length === 0 && websockets.length === 0 && subpackages.length === 0) {
        return;
    }

    return {
        type: "apiSection",
        api,
        id: subpackageId,
        title: titleCase(subpackage.name),
        slug,
        endpoints,
        webhooks,
        websockets,
        subpackages,
        artifacts: null,
    };
}

function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return "/" + path.map((part) => (part.type === "literal" ? part.value : `${part.value}`)).join("/");
}

export function resolveSidebarNodes(
    navigationItems: DocsV1Read.NavigationItem[],
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: string[] = [],
): SidebarNode[] {
    const sidebarNodes: SidebarNode[] = [];
    for (const navigationItem of navigationItems) {
        visitDiscriminatedUnion(navigationItem, "type")._visit({
            page: (page) => {
                const lastSidebarNode = last(sidebarNodes);
                if (lastSidebarNode != null && lastSidebarNode.type === "pageGroup") {
                    lastSidebarNode.pages.push({
                        ...page,
                        slug: [...parentSlugs, page.urlSlug],
                        type: "page",
                    });
                } else {
                    sidebarNodes.push({
                        type: "pageGroup",
                        pages: [
                            {
                                ...page,
                                slug: [...parentSlugs, page.urlSlug],
                                type: "page",
                            },
                        ],
                    });
                }
            },
            api: (api) => {
                const definition = apis[api.api];
                if (definition != null) {
                    const definitionSlug = api.skipUrlSlug ? parentSlugs : [...parentSlugs, api.urlSlug];
                    sidebarNodes.push({
                        type: "apiSection",
                        api: api.api,
                        id: api.api,
                        title: api.title,
                        slug: [...parentSlugs, api.urlSlug],
                        endpoints: sortBy(
                            definition.rootPackage.endpoints.map((endpoint) => ({
                                type: "page",
                                id: endpoint.id,
                                slug: [...definitionSlug, endpoint.urlSlug],
                                title:
                                    endpoint.name != null
                                        ? endpoint.name
                                        : stringifyEndpointPathParts(endpoint.path.parts),
                                method: endpoint.method,
                                stream: endpoint.response?.type.type === "stream",
                                description: endpoint.description,
                            })),
                            "title",
                        ),
                        webhooks: sortBy(
                            definition.rootPackage.webhooks.map((webhook) => ({
                                type: "page",
                                id: webhook.id,
                                slug: [...definitionSlug, webhook.urlSlug],
                                title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
                                description: webhook.description,
                            })),
                            "title",
                        ),
                        websockets: sortBy(
                            definition.rootPackage.websockets.map((websocket) => ({
                                type: "page",
                                id: websocket.id,
                                slug: [...definitionSlug, websocket.urlSlug],
                                title:
                                    websocket.name != null
                                        ? websocket.name
                                        : stringifyEndpointPathParts(websocket.path.parts),
                            })),
                            "title",
                        ),
                        subpackages: sortBy(
                            definition.rootPackage.subpackages
                                .map((subpackageId) =>
                                    resolveSidebarNodeApiSection(
                                        api.api,
                                        subpackageId,
                                        definition.subpackages,
                                        definitionSlug,
                                    ),
                                )
                                .filter(isNonNullish),
                            "title",
                        ),
                        artifacts: api.artifacts ?? null,
                    });
                }
            },
            section: (section) => {
                const sectionSlug = section.skipUrlSlug ? parentSlugs : [...parentSlugs, section.urlSlug];
                sidebarNodes.push({
                    type: "section",
                    title: section.title,
                    slug: sectionSlug,
                    items: resolveSidebarNodes(section.items, apis, section.skipUrlSlug ? parentSlugs : sectionSlug),
                });
            },
            link: (link) => {
                const lastSidebarNode = last(sidebarNodes);
                if (lastSidebarNode != null && lastSidebarNode.type === "pageGroup") {
                    lastSidebarNode.pages.push(link);
                } else {
                    sidebarNodes.push({
                        type: "pageGroup",
                        pages: [link],
                    });
                }
            },
            _other: noop,
        });
    }

    return sidebarNodes;
}
