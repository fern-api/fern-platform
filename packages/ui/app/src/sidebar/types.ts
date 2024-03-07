import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isSubpackage } from "../util/fern";
import { titleCase } from "../util/titleCase";

export interface ColorsConfig {
    light: DocsV1Read.ThemeConfig | undefined;
    dark: DocsV1Read.ThemeConfig | undefined;
}

export interface SidebarVersionInfo {
    id: string;
    slug: string[];
    index: number;
    availability: DocsV1Read.VersionAvailability | null;
}

export interface SidebarTab {
    title: string;
    icon: string;
    slug: string[];
}

export interface SidebarNavigation {
    currentTabIndex: number | undefined;
    tabs: SidebarTab[];
    currentVersionIndex: number | undefined;
    versions: SidebarVersionInfo[];
    sidebarNodes: SidebarNode[];
    slug: string[]; // contains basepath, current version, and tab
}

export type SidebarNode = SidebarNode.PageGroup | SidebarNode.ApiSection | SidebarNode.Section;

export declare namespace SidebarNode {
    export interface PageGroup {
        type: "pageGroup";
        slug: string[];
        pages: (SidebarNode.Page | SidebarNode.Link)[];
    }

    export interface ChangelogPage extends Page {
        pageType: "changelog";
        pageId: string | undefined;
        items: {
            date: string;
            pageId: string;
        }[];
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
        showErrors: boolean;
        changelog: ChangelogPage | undefined;
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
    showErrors: boolean,
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
            showErrors,
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
        showErrors,
        artifacts: undefined,
        changelog: undefined,
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
                const lastSidebarNode = sidebarNodes[sidebarNodes.length - 1];
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
                        api.showErrors,
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
                                      slug: [...definitionSlug, api.changelog.urlSlug],
                                      items: api.changelog.items.map((item) => ({
                                          date: item.date,
                                          pageId: item.pageId,
                                      })),
                                  }
                                : undefined,
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
                const lastSidebarNode = sidebarNodes[sidebarNodes.length - 1];
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
            _other: () => Promise.resolve(),
        });
    }

    return sidebarNodes;
}

function matchSlug(slug: string[], nodeSlug: string[]): boolean {
    for (let i = 0; i < slug.length; i++) {
        if (slug[i] !== nodeSlug[i]) {
            return false;
        }
    }
    return true;
}

interface TraverseState {
    prev: SidebarNode.Page | undefined;
    curr: SidebarNode.Page | undefined;
    sectionTitleBreadcrumbs: string[];
    next: SidebarNode.Page | undefined;
}

function visitPage(
    page: SidebarNode.Page,
    slug: string[],
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }
    if (traverseState.curr == null) {
        if (matchSlug(slug, page.slug)) {
            traverseState.curr = page;
            traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
        } else {
            traverseState.prev = page;
        }
    } else {
        traverseState.next = page;
    }
    return traverseState;
}

function visitNode(
    node: SidebarNode,
    slug: string[],
    traverseState: TraverseState,
    sectionTitleBreadcrumbs: string[],
): TraverseState {
    if (traverseState.next != null) {
        return traverseState;
    }

    return visitDiscriminatedUnion(node, "type")._visit({
        pageGroup: (pageGroup) => {
            if (matchSlug(slug, pageGroup.slug) && slug.length < pageGroup.slug.length) {
                traverseState.curr = pageGroup.pages.find((page) => page.type === "page") as
                    | SidebarNode.Page
                    | undefined;
                traverseState.sectionTitleBreadcrumbs = sectionTitleBreadcrumbs;
            }

            for (const page of pageGroup.pages) {
                if (page.type === "page") {
                    traverseState = visitPage(page, slug, traverseState, sectionTitleBreadcrumbs);
                    if (traverseState.next != null) {
                        return traverseState;
                    }
                }
            }

            return traverseState;
        },
        apiSection: (apiSection) => {
            const apiSectionBreadcrumbs = [...sectionTitleBreadcrumbs, apiSection.title];
            if (matchSlug(slug, apiSection.slug) && slug.length < apiSection.slug.length) {
                traverseState.curr = apiSection.endpoints[0] ?? apiSection.websockets[0] ?? apiSection.webhooks[0];
                traverseState.sectionTitleBreadcrumbs = apiSectionBreadcrumbs;
            }

            if (apiSection.changelog != null) {
                traverseState = visitPage(apiSection.changelog, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const endpoint of apiSection.endpoints) {
                traverseState = visitPage(endpoint, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const websocket of apiSection.websockets) {
                traverseState = visitPage(websocket, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const webhook of apiSection.webhooks) {
                traverseState = visitPage(webhook, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            for (const subpackage of apiSection.subpackages) {
                traverseState = visitNode(subpackage, slug, traverseState, apiSectionBreadcrumbs);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            if (matchSlug(slug, apiSection.slug) && slug.length < apiSection.slug.length) {
                traverseState.curr = apiSection.changelog;
                traverseState.sectionTitleBreadcrumbs = apiSectionBreadcrumbs;
            }

            return traverseState;
        },
        section: (section) => {
            for (const item of section.items) {
                traverseState = visitNode(item, slug, traverseState, [...sectionTitleBreadcrumbs, section.title]);
                if (traverseState.next != null) {
                    return traverseState;
                }
            }

            return traverseState;
        },
        _other: () => traverseState,
    });
}

export function visitSidebarNodes(sidebarNodes: SidebarNode[], slug: string[]): TraverseState {
    let traverseState: TraverseState = {
        prev: undefined,
        curr: undefined,
        next: undefined,
        sectionTitleBreadcrumbs: [],
    };
    for (const node of sidebarNodes) {
        traverseState = visitNode(node, slug, traverseState, []);
        if (traverseState.next != null) {
            break;
        }
    }
    return traverseState;
}

export function findApiSection(api: string, sidebarNodes: SidebarNode[]): SidebarNode.ApiSection | undefined {
    for (const node of sidebarNodes) {
        if (node.type === "apiSection") {
            if (node.id === api) {
                return node;
            }
        } else if (node.type === "section") {
            const innerSection = findApiSection(api, node.items);
            if (innerSection != null) {
                return innerSection;
            }
        }
    }
    return undefined;
}

export function isPage(node: SidebarNode.Page | SidebarNode.Link): node is SidebarNode.Page {
    return node.type === "page";
}

export function isApiPage(node: SidebarNode.Page): node is SidebarNode.ApiPage {
    return node.type === "page" && "api" in node;
}

export function isChangelogPage(node: SidebarNode.Page): node is SidebarNode.ChangelogPage {
    return node.type === "page" && (node as SidebarNode.ChangelogPage).pageType === "changelog";
}

export function isEndpointPage(node: SidebarNode.Page): node is SidebarNode.EndpointPage {
    return node.type === "page" && "method" in node;
}
