import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { titleCase } from "@fern-ui/app-utils";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last, noop } from "lodash-es";

export type SidebarNode = SidebarNode.PageGroup | SidebarNode.ApiSection | SidebarNode.Section;

export declare namespace SidebarNode {
    export interface PageGroup {
        type: "pageGroup";
        pages: SidebarNode.Page[];
    }

    export interface ApiSection {
        type: "apiSection";
        api: FdrAPI.ApiId;
        id: string;
        title: string;
        slug: string[];
        endpoints: SidebarNode.EndpointPage[];
        webhooks: SidebarNode.Page[];
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
        id: string;
        slug: string[];
        title: string;
    }

    export interface EndpointPage extends Page {
        method: APIV1Read.HttpMethod;
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
    const endpoints = subpackage.endpoints.map((endpoint) => ({
        id: endpoint.id,
        slug: [...slug, endpoint.urlSlug],
        title: endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
        method: endpoint.method,
    }));
    const webhooks = subpackage.webhooks.map((webhook) => ({
        id: webhook.id,
        slug: [...slug, webhook.urlSlug],
        title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
    }));
    const subpackages = subpackage.subpackages
        .map((innerSubpackageId) => resolveSidebarNodeApiSection(api, innerSubpackageId, subpackagesMap, slug))
        .filter(isNonNullish);

    if (endpoints.length === 0 && webhooks.length === 0 && subpackages.length === 0) {
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
                    });
                } else {
                    sidebarNodes.push({
                        type: "pageGroup",
                        pages: [
                            {
                                ...page,
                                slug: [...parentSlugs, page.urlSlug],
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
                        endpoints: definition.rootPackage.endpoints.map((endpoint) => ({
                            id: endpoint.id,
                            slug: [...definitionSlug, endpoint.urlSlug],
                            title:
                                endpoint.name != null ? endpoint.name : stringifyEndpointPathParts(endpoint.path.parts),
                            method: endpoint.method,
                        })),
                        webhooks: definition.rootPackage.webhooks.map((webhook) => ({
                            id: webhook.id,
                            slug: [...definitionSlug, webhook.urlSlug],
                            title: webhook.name != null ? webhook.name : "/" + webhook.path.join("/"),
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
            _other: noop,
        });
    }

    return sidebarNodes;
}
