import { APIV1Read, DocsV1Read, FdrAPI, VersionInfo } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last, noop } from "lodash-es";
import { isSubpackage } from "../util/fern";
import { titleCase } from "../util/titleCase";

export interface SidebarNavigation {
    currentTabIndex: number | undefined;
    tabs: Omit<DocsV1Read.NavigationTab, "items">[];
    currentVersionIndex: number | undefined;
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
        artifacts: DocsV1Read.ApiArtifacts | undefined;
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
        description: string | undefined;
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

async function resolveSidebarNodeApiSection(
    api: FdrAPI.ApiId,
    id: string,
    package_: APIV1Read.ApiDefinitionPackage | undefined,
    title: string,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: string[],
): Promise<SidebarNode.ApiSection | undefined> {
    let subpackage: APIV1Read.ApiDefinitionPackage | undefined = package_;
    while (subpackage?.pointsTo != null) {
        subpackage = subpackagesMap[subpackage.pointsTo];
    }
    if (subpackage == null) {
        return;
    }
    const slug = package_ != null && isSubpackage(package_) ? [...parentSlugs, package_.urlSlug] : parentSlugs;
    const endpointsPromise = subpackage.endpoints.map(
        async (endpoint): Promise<SidebarNode.EndpointPage> => ({
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
    const websocketsPromise = subpackage.websockets.map(
        async (websocket): Promise<SidebarNode.ApiPage> => ({
            type: "page",
            api,
            id: websocket.id,
            slug: [...slug, websocket.urlSlug],
            title: websocket.name != null ? websocket.name : stringifyEndpointPathParts(websocket.path.parts),
            description: websocket.description,
        }),
    );
    const webhooksPromise = subpackage.webhooks.map(
        async (webhook): Promise<SidebarNode.ApiPage> => ({
            type: "page",
            api,
            id: webhook.id,
            slug: [...slug, webhook.urlSlug],
            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
            description: webhook.description,
        }),
    );
    const subpackagesPromise = subpackage.subpackages.map((innerSubpackageId) =>
        resolveSidebarNodeApiSection(
            api,
            innerSubpackageId,
            subpackagesMap[innerSubpackageId],
            titleCase(subpackagesMap[innerSubpackageId]?.name ?? ""),
            subpackagesMap,
            slug,
        ),
    );

    const [endpoints, websockets, webhooks, subpackagesOrNull] = await Promise.all([
        Promise.all(endpointsPromise),
        Promise.all(websocketsPromise),
        Promise.all(webhooksPromise),
        Promise.all(subpackagesPromise),
    ]);

    const subpackages = subpackagesOrNull.filter((subpackage) => subpackage != null) as SidebarNode.ApiSection[];

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
        artifacts: undefined,
    };
}

function stringifyEndpointPathParts(path: APIV1Read.EndpointPathPart[]): string {
    return "/" + path.map((part) => (part.type === "literal" ? part.value : `${part.value}`)).join("/");
}

export async function resolveSidebarNodes(
    navigationItems: DocsV1Read.NavigationItem[],
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: string[] = [],
): Promise<SidebarNode[]> {
    const sidebarNodes: SidebarNode[] = [];
    for (const navigationItem of navigationItems) {
        await visitDiscriminatedUnion(navigationItem, "type")._visit<Promise<void> | void>({
            page: (page) => {
                const lastSidebarNode = last(sidebarNodes);
                if (lastSidebarNode != null && lastSidebarNode.type === "pageGroup") {
                    lastSidebarNode.pages.push({
                        ...page,
                        slug: [...parentSlugs, page.urlSlug],
                        type: "page",
                        description: undefined,
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
                                description: undefined,
                            },
                        ],
                    });
                }
            },
            api: async (api) => {
                const definition = apis[api.api];
                if (definition != null) {
                    const definitionSlug = api.skipUrlSlug ? parentSlugs : [...parentSlugs, api.urlSlug];
                    const resolved = await resolveSidebarNodeApiSection(
                        api.api,
                        api.api,
                        definition.rootPackage,
                        api.title,
                        definition.subpackages,
                        definitionSlug,
                    );
                    sidebarNodes.push({
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
                    });
                }
            },
            section: async (section) => {
                const sectionSlug = section.skipUrlSlug ? parentSlugs : [...parentSlugs, section.urlSlug];
                sidebarNodes.push({
                    type: "section",
                    title: section.title,
                    slug: sectionSlug,
                    items: await resolveSidebarNodes(section.items, apis, sectionSlug),
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
