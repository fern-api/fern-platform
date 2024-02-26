import { APIV1Read, DocsV1Read, FdrAPI, VersionInfo } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last, noop } from "lodash-es";
import { titleCase } from "../util/titleCase";

export interface SidebarNavigation {
    currentTabIndex: number | null;
    tabs: Omit<DocsV1Read.NavigationTab, "items">[];
    currentVersionIndex: number | null;
    versions: VersionInfo[];
    sidebarNodes: SidebarNode[];
}

export type SidebarNode = SidebarNode.PageGroup | SidebarNode.ApiSection | SidebarNode.Section;

export declare namespace SidebarNode {
    export interface PageGroup {
        type: "pageGroup";
        slug: string[];
        pages: (SidebarNode.Page | SidebarNode.Link)[];
    }

    export interface ApiSection {
        type: "apiSection";
        api: FdrAPI.ApiId;
        id: string;
        title: string;
        slug: string[];
        endpoints: SidebarNode.EndpointPage[];
        webhooks: SidebarNode.ApiPage[];
        websockets: SidebarNode.ApiPage[];
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
        description: string | null;
    }

    export interface Link {
        type: "link";
        title: string;
        url: string;
    }

    export interface ApiPage extends Page {
        api: FdrAPI.ApiId;
    }

    export interface EndpointPage extends ApiPage {
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
    const endpoints = subpackage.endpoints
        .filter((endpoint) => endpoint.request?.contentType !== "multipart/form-data")
        .map(
            (endpoint): SidebarNode.EndpointPage => ({
                type: "page",
                api,
                id: endpoint.id,
                slug: [...slug, endpoint.urlSlug],
                title: endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
                description: endpoint.description ?? null,
                method: endpoint.method,
                stream: endpoint.response?.type.type === "stream",
            }),
        );
    const websockets = subpackage.websockets.map(
        (websocket): SidebarNode.ApiPage => ({
            type: "page",
            api,
            id: websocket.id,
            slug: [...slug, websocket.urlSlug],
            title: websocket.name != null ? websocket.name : stringifyEndpointPathParts(websocket.path.parts),
            description: websocket.description ?? null,
        }),
    );
    const webhooks = subpackage.webhooks.map(
        (webhook): SidebarNode.ApiPage => ({
            type: "page",
            api,
            id: webhook.id,
            slug: [...slug, webhook.urlSlug],
            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
            description: webhook.description ?? null,
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
                        description: null,
                    });
                } else {
                    sidebarNodes.push({
                        type: "pageGroup",
                        slug: parentSlugs,
                        pages: [
                            {
                                ...page,
                                slug: [...parentSlugs, page.urlSlug],
                                type: "page",
                                description: null,
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
                        endpoints: definition.rootPackage.endpoints
                            .filter((endpoint) => endpoint.request?.contentType !== "multipart/form-data")
                            .map(
                                (endpoint): SidebarNode.EndpointPage => ({
                                    type: "page",
                                    api: api.api,
                                    id: endpoint.id,
                                    slug: [...definitionSlug, endpoint.urlSlug],
                                    title:
                                        endpoint.name != null
                                            ? endpoint.name
                                            : stringifyEndpointPathParts(endpoint.path.parts),
                                    method: endpoint.method,
                                    stream: endpoint.response?.type.type === "stream",
                                    description: endpoint.description ?? null,
                                }),
                            ),
                        webhooks: definition.rootPackage.webhooks.map((webhook) => ({
                            type: "page",
                            api: api.api,
                            id: webhook.id,
                            slug: [...definitionSlug, webhook.urlSlug],
                            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
                            description: webhook.description ?? null,
                        })),
                        websockets: definition.rootPackage.websockets.map((websocket) => ({
                            type: "page",
                            api: api.api,
                            id: websocket.id,
                            slug: [...definitionSlug, websocket.urlSlug],
                            title:
                                websocket.name != null
                                    ? websocket.name
                                    : stringifyEndpointPathParts(websocket.path.parts),
                            description: websocket.description ?? null,
                        })),
                        subpackages: definition.rootPackage.subpackages
                            .map((subpackageId) =>
                                resolveSidebarNodeApiSection(
                                    api.api,
                                    subpackageId,
                                    definition.subpackages,
                                    definitionSlug,
                                ),
                            )
                            .filter(isNonNullish),
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
                        slug: parentSlugs,
                        pages: [link],
                    });
                }
            },
            _other: noop,
        });
    }

    return sidebarNodes;
}

export function resolveActiveSidebarNode(
    sidebarNodes: SidebarNode[],
    fullSlug: string[],
): SidebarNode.Page | undefined {
    for (const node of sidebarNodes) {
        const activeNode = resolveActiveSidebarNodeRecursive(node, fullSlug);
        if (activeNode != null) {
            return activeNode;
        }
    }
    if (sidebarNodes[0] != null) {
        return resolveActiveSidebarNodeRecursive(sidebarNodes[0], sidebarNodes[0].slug);
    }
    return undefined;
}

export function resolveActiveSidebarNodeRecursive(node: SidebarNode, fullSlug: string[]): SidebarNode.Page | undefined {
    if (node.type === "section") {
        if (fullSlug.join("/") === node.slug.join("/") && node.items[0] != null) {
            // get the first page in the section
            const firstPage = resolveActiveSidebarNodeRecursive(node.items[0], node.items[0].slug);
            if (firstPage != null) {
                return firstPage;
            }
        }
        for (const item of node.items) {
            const activeNode = resolveActiveSidebarNodeRecursive(item, fullSlug);
            if (activeNode != null) {
                return activeNode;
            }
        }
    } else if (node.type === "apiSection") {
        if (fullSlug.join("/") === node.slug.join("/")) {
            return node.endpoints[0] ?? node.websockets[0] ?? node.webhooks[0];
        } else {
            for (const endpoint of node.endpoints) {
                if (fullSlug.join("/") === endpoint.slug.join("/")) {
                    return endpoint;
                }
            }
            for (const websocket of node.websockets) {
                if (fullSlug.join("/") === websocket.slug.join("/")) {
                    return websocket;
                }
            }
            for (const webhook of node.webhooks) {
                if (fullSlug.join("/") === webhook.slug.join("/")) {
                    return webhook;
                }
            }
            for (const subpackage of node.subpackages) {
                const activeNode = resolveActiveSidebarNodeRecursive(subpackage, fullSlug);
                if (activeNode != null) {
                    return activeNode;
                }
            }
        }
    } else if (node.type === "pageGroup") {
        if (fullSlug.join("/") === node.slug.join("/")) {
            const firstPage = node.pages.find((page) => page.type === "page") as SidebarNode.Page | undefined;
            if (firstPage != null) {
                return firstPage;
            }
        }
        for (const page of node.pages) {
            if (page.type === "page" && fullSlug.join("/") === page.slug.join("/")) {
                return page;
            }
        }
    }
    return;
}

export function isApiPage(node: SidebarNode.Page): node is SidebarNode.ApiPage {
    return node.type === "page" && "api" in node;
}
