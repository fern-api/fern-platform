import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { assertNever, noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { stringifyEndpointPathParts } from "./stringifyEndpointPathParts";

/**
 * Flattened API Definition lightly transforms the APIV1Read.ApiDefinition into a more usable format:
 *  - We flatten the API package structure into a list of items, so that it's order is consistent throughout the fern docs.
 *  - The docs config also may inject supplementary mdx pages into the package structure.
 *  - The items are then ordered according to the docs config.
 *  - All optional keys are turned into strict nullable properties.
 *
 * This "flattening" operation should be relatively cheap, and is consumed by two resolvers:
 *  - the sidebar node resolver (which renders the sidebar navigation on every page)
 *  - the full resolver (which should only run on api reference pages, since it's expensive and data-rich)
 */

export interface FlattenedParameter {
    key: string;
    type: APIV1Read.TypeReference;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
}

interface FlattenedNodeMetadata {
    slug: readonly string[];
    icon: string | undefined;
    hidden: boolean;
}
export interface FlattenedEndpointDefinition extends FlattenedNodeMetadata {
    type: "endpoint";
    id: string;
    name: string;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
    authed: boolean;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    path: APIV1Read.EndpointPath;
    queryParameters: APIV1Read.QueryParameter[];
    headers: APIV1Read.Header[];
    request: APIV1Read.HttpRequest | undefined;
    response: APIV1Read.HttpResponse | undefined;
    errors: APIV1Read.ErrorDeclarationV2[];
    examples: APIV1Read.ExampleEndpointCall[];
    snippetTemplates: APIV1Read.EndpointSnippetTemplates | undefined;

    // stream variant of the endpoint
    stream: FlattenedEndpointDefinition | undefined;
}

export interface FlattenedWebSocketChannel extends FlattenedNodeMetadata {
    type: "websocket";
    id: string;
    name: string | undefined;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
    authed: boolean;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    path: APIV1Read.EndpointPath;
    headers: APIV1Read.Header[];
    queryParameters: APIV1Read.QueryParameter[];
    messages: APIV1Read.WebSocketMessage[];
    examples: APIV1Read.ExampleWebSocketSession[];
}

export interface FlattenedWebhookDefinition extends FlattenedNodeMetadata {
    type: "webhook";
    id: string;
    name: string | undefined;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
    method: APIV1Read.WebhookHttpMethod;
    path: string[];
    headers: APIV1Read.Header[];
    payload: APIV1Read.WebhookPayload;
    examples: APIV1Read.ExampleWebhookPayload[];
}

export interface FlattenedSubpackage extends FlattenedApiDefinitionPackage {
    type: "subpackage";
}

export interface FlattenedPageMetadata extends FlattenedNodeMetadata {
    type: "page";
    id: DocsV1Read.PageId;
    title: string;
}

export function isFlattenedSubpackage(package_: FlattenedApiDefinitionPackage): package_ is FlattenedSubpackage {
    return (package_ as FlattenedSubpackage).type === "subpackage";
}

export type FlattenedApiDefinitionPackageItem =
    | FlattenedEndpointDefinition
    | FlattenedWebSocketChannel
    | FlattenedWebhookDefinition
    | FlattenedSubpackage
    | FlattenedPageMetadata;

export const FlattenedApiDefinitionPackageItem = {
    visit: <T>(
        item: FlattenedApiDefinitionPackageItem,
        visitor: {
            endpoint: (endpoint: FlattenedEndpointDefinition) => T;
            websocket: (websocket: FlattenedWebSocketChannel) => T;
            webhook: (webhook: FlattenedWebhookDefinition) => T;
            subpackage: (subpackage: FlattenedSubpackage) => T;
            page: (page: FlattenedPageMetadata) => T;
        },
    ): T => {
        switch (item.type) {
            case "endpoint":
                return visitor.endpoint(item);
            case "websocket":
                return visitor.websocket(item);
            case "webhook":
                return visitor.webhook(item);
            case "subpackage":
                return visitor.subpackage(item);
            case "page":
                return visitor.page(item);
            default:
                assertNever(item);
        }
    },
    isSubpackage: (item: FlattenedApiDefinitionPackageItem): item is FlattenedSubpackage => item.type === "subpackage",
    isEndpoint: (item: FlattenedApiDefinitionPackageItem): item is FlattenedEndpointDefinition =>
        item.type === "endpoint",
    isWebSocket: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebSocketChannel =>
        item.type === "websocket",
    isWebhook: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebhookDefinition => item.type === "webhook",
    isPage: (item: FlattenedApiDefinitionPackageItem): item is FlattenedPageMetadata => item.type === "page",
};

export interface FlattenedApiDefinitionPackage {
    summaryPageId: DocsV1Read.PageId | undefined;
    items: FlattenedApiDefinitionPackageItem[];
    slug: readonly string[];
    // usedTypes: readonly string[];
    title: string;
    description: string | undefined;
    icon: string | undefined;
    hidden: boolean;
    subpackageId: DocsV1Read.SubpackageId | undefined;
}

export interface FlattenedApiDefinition extends FlattenedApiDefinitionPackage {
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, APIV1Read.TypeDefinition>;
    globalHeaders: APIV1Read.Header[];
    isSidebarFlattened: boolean;
}

export function flattenApiDefinition(
    apiDefinition: APIV1Read.ApiDefinition,
    parentSlugs: readonly string[],
    api: DocsV1Read.NavigationItem.Api,
    domain: string,
): FlattenedApiDefinition {
    const apiDefinitions = collectApiDefinitions(apiDefinition.rootPackage, apiDefinition.subpackages);

    const rootNavigationOrder: DocsV1Read.ApiNavigationConfigSection | undefined =
        api.navigationV2 != null
            ? {
                  title: {
                      type: "custom",
                      title: api.title,
                  },
                  summaryPageId: api.navigationV2.summaryPageId,
                  items: api.navigationV2.items,
                  icon: api.icon,
                  hidden: api.hidden,
                  urlSlug: api.urlSlug,
                  fullSlug: api.fullSlug,
              }
            : undefined;

    const orderedPackage = constructPackageFromNavigationOrder(
        rootNavigationOrder,
        apiDefinitions,
        parentSlugs,
        apiDefinition.subpackages,
    );

    const package_ = flattenPackage(
        orderedPackage.package,
        orderedPackage.visitedEndpoints,
        orderedPackage.visitedWebsockets,
        orderedPackage.visitedWebhooks,
        orderedPackage.visitedSubpackages,
        undefined,
        apiDefinition.rootPackage,
        apiDefinition.subpackages,
        parentSlugs,
        domain,
    );

    return {
        api: apiDefinition.id,
        auth: apiDefinition.auth,
        types: apiDefinition.types,
        globalHeaders: apiDefinition.globalHeaders ?? [],
        isSidebarFlattened: api.flattened ?? false,
        ...package_,
    };
}

interface OrderedPackageReturnValue {
    package: FlattenedApiDefinitionPackage;
    visitedEndpoints: Set<string>;
    visitedWebsockets: Set<string>;
    visitedWebhooks: Set<string>;
    visitedSubpackages: Set<string>;
}

function constructPackageFromNavigationOrder(
    order: DocsV1Read.ApiNavigationConfigSection | undefined,
    apiDefinitions: GlobalApiDefinitions,
    parentSlugs: readonly string[],
    subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
): OrderedPackageReturnValue {
    const items: FlattenedApiDefinitionPackageItem[] = [];
    const visitedEndpoints = new Set<string>();
    const visitedWebsockets = new Set<string>();
    const visitedWebhooks = new Set<string>();
    const visitedSubpackages = new Set<string>();

    order?.items.forEach((item) =>
        visitDiscriminatedUnion(item, "type")._visit({
            page: (page) => {
                items.push({
                    type: "page",
                    id: page.id,
                    slug: page.fullSlug ?? [...parentSlugs, page.urlSlug],
                    title: page.title,
                    icon: page.icon,
                    hidden: page.hidden ?? false,
                });
            },
            section: (section) => {
                const convertedSection = constructPackageFromNavigationOrder(
                    section,
                    apiDefinitions,
                    section.fullSlug ?? [...parentSlugs, section.urlSlug],
                    subpackages,
                );
                items.push({
                    type: "subpackage",
                    ...convertedSection.package,
                });
                convertedSection.visitedEndpoints.forEach((endpointId) => visitedEndpoints.add(endpointId));
                convertedSection.visitedWebsockets.forEach((websocketId) => visitedWebsockets.add(websocketId));
                convertedSection.visitedWebhooks.forEach((webhookId) => visitedWebhooks.add(webhookId));
                convertedSection.visitedSubpackages.forEach((subpackageId) => visitedSubpackages.add(subpackageId));
            },
            node: (node) =>
                visitDiscriminatedUnion(node.value, "type")._visit({
                    endpoint: (endpoint) => {
                        const locator =
                            endpoint.subpackageId != null
                                ? `${endpoint.subpackageId}.${endpoint.endpointId}`
                                : endpoint.endpointId;
                        const referencedEndpoint = apiDefinitions.endpoints.get(locator);
                        if (referencedEndpoint == null) {
                            // eslint-disable-next-line no-console
                            console.error(`Endpoint ${locator} not found`);
                            return;
                        }
                        items.push(
                            toFlattenedEndpoint(referencedEndpoint, {
                                slug: endpoint.fullSlug ?? [...parentSlugs, endpoint.urlSlug],
                                icon: endpoint.icon,
                                hidden: endpoint.hidden ?? false,
                            }),
                        );
                        visitedEndpoints.add(locator);
                    },
                    websocket: (websocket) => {
                        const locator =
                            websocket.subpackageId != null
                                ? `${websocket.subpackageId}.${websocket.webSocketId}`
                                : websocket.webSocketId;
                        const referencedWebSocket = apiDefinitions.websockets.get(locator);
                        if (referencedWebSocket == null) {
                            // eslint-disable-next-line no-console
                            console.error(`WebSocket ${locator} not found`);
                            return;
                        }
                        items.push(
                            toFlattenedWebSocketChannel(referencedWebSocket, {
                                slug: websocket.fullSlug ?? [...parentSlugs, websocket.urlSlug],
                                icon: websocket.icon,
                                hidden: websocket.hidden ?? false,
                            }),
                        );
                        visitedWebsockets.add(locator);
                    },
                    webhook: (webhook) => {
                        const locator =
                            webhook.subpackageId != null
                                ? `${webhook.subpackageId}.${webhook.webhookId}`
                                : webhook.webhookId;
                        const referencedWebhook = apiDefinitions.webhooks.get(locator);
                        if (referencedWebhook == null) {
                            // eslint-disable-next-line no-console
                            console.error(`Webhook ${locator} not found`);
                            return;
                        }
                        items.push(
                            toFlattenedWebhookDefinition(referencedWebhook, {
                                slug: webhook.fullSlug ?? [...parentSlugs, webhook.urlSlug],
                                icon: webhook.icon,
                                hidden: webhook.hidden ?? false,
                            }),
                        );
                        visitedWebhooks.add(locator);
                    },
                    _other: noop,
                }),
            _other: noop,
        }),
    );

    const subpackageId = order?.title.type === "subpackage" ? order.title.subpackageId : undefined;
    let subpackage = subpackageId != null ? subpackages[subpackageId] : undefined;
    while (subpackage?.pointsTo != null) {
        subpackage = subpackages[subpackage.pointsTo];
    }

    if (subpackageId != null) {
        visitedSubpackages.add(subpackageId);
    }

    const package_: FlattenedApiDefinitionPackage = {
        summaryPageId: order?.summaryPageId,
        items,
        slug: parentSlugs,
        title:
            order?.title.type === "custom"
                ? order.title.title
                : order?.title.title ?? subpackage?.displayName ?? subpackage?.name ?? "API Reference",
        icon: order?.icon,
        hidden: order?.hidden ?? false,
        subpackageId: order?.title.type === "subpackage" ? order.title.subpackageId : order?.title.title,
        description: subpackage?.description,
    };

    return {
        package: package_,
        visitedEndpoints,
        visitedWebsockets,
        visitedWebhooks,
        visitedSubpackages,
    };
}

interface GlobalApiDefinitions {
    endpoints: Map<string, APIV1Read.EndpointDefinition>;
    websockets: Map<string, APIV1Read.WebSocketChannel>;
    webhooks: Map<string, APIV1Read.WebhookDefinition>;
}

function collectApiDefinitions(
    rootPackage: APIV1Read.ApiDefinitionPackage,
    subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
): GlobalApiDefinitions {
    const endpoints = new Map<string, APIV1Read.EndpointDefinition>();
    const websockets = new Map<string, APIV1Read.WebSocketChannel>();
    const webhooks = new Map<string, APIV1Read.WebhookDefinition>();

    rootPackage.endpoints.forEach((endpoint) => endpoints.set(endpoint.id, endpoint));
    rootPackage.websockets.forEach((websocket) => websockets.set(websocket.id, websocket));
    rootPackage.webhooks.forEach((webhook) => webhooks.set(webhook.id, webhook));

    Object.entries(subpackages).forEach(([subpackageId, subpackage]) => {
        subpackage.endpoints.forEach((endpoint) => endpoints.set(`${subpackageId}.${endpoint.id}`, endpoint));
        subpackage.websockets.forEach((websocket) => websockets.set(`${subpackageId}.${websocket.id}`, websocket));
        subpackage.webhooks.forEach((webhook) => webhooks.set(`${subpackageId}.${webhook.id}`, webhook));
    });

    return {
        endpoints,
        websockets,
        webhooks,
    };
}

function toFlattenedEndpoint(
    endpoint: APIV1Read.EndpointDefinition,
    metadata: FlattenedNodeMetadata,
): FlattenedEndpointDefinition {
    return {
        type: "endpoint",
        id: endpoint.id,
        name: endpoint.name ?? stringifyEndpointPathParts(endpoint.path.parts),
        description: endpoint.description,
        availability: endpoint.availability,
        authed: endpoint.authed,
        defaultEnvironment: endpoint.environments.find((enironment) => enironment.id === endpoint.defaultEnvironment),
        environments: endpoint.environments,
        method: endpoint.method,
        path: endpoint.path,
        queryParameters: endpoint.queryParameters,
        headers: endpoint.headers,
        request: endpoint.request,
        response: endpoint.response,
        errors: endpoint.errorsV2 ?? [],
        examples: endpoint.examples,
        snippetTemplates: endpoint.snippetTemplates,
        stream: undefined,
        ...metadata,
    };
}

function toFlattenedWebSocketChannel(
    websocket: APIV1Read.WebSocketChannel,
    metadata: FlattenedNodeMetadata,
): FlattenedWebSocketChannel {
    return {
        type: "websocket",
        id: websocket.id,
        name: websocket.name,
        description: websocket.description,
        availability: websocket.availability,
        authed: websocket.auth,
        defaultEnvironment: websocket.environments.find((enironment) => enironment.id === websocket.defaultEnvironment),
        environments: websocket.environments,
        path: websocket.path,
        headers: websocket.headers,
        queryParameters: websocket.queryParameters,
        messages: websocket.messages,
        examples: websocket.examples,
        ...metadata,
    };
}

function toFlattenedWebhookDefinition(
    webhook: APIV1Read.WebhookDefinition,
    metadata: FlattenedNodeMetadata,
): FlattenedWebhookDefinition {
    return {
        type: "webhook",
        id: webhook.id,
        name: webhook.name,
        description: webhook.description,
        availability: undefined,
        method: webhook.method,
        path: webhook.path,
        headers: webhook.headers,
        payload: webhook.payload,
        examples: webhook.examples,
        ...metadata,
    };
}

function flattenPackage(
    package_: FlattenedApiDefinitionPackage | undefined,
    visitedEndpoints: ReadonlySet<string>,
    visitedWebsockets: ReadonlySet<string>,
    visitedWebhooks: ReadonlySet<string>,
    visitedSubpackages: ReadonlySet<string>,
    subpackageId: APIV1Read.SubpackageId | undefined,
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: readonly string[],
    domain: string,
): FlattenedApiDefinitionPackage {
    let currentPackage: APIV1Read.ApiDefinitionPackage | undefined = apiDefinitionPackage;
    while (currentPackage?.pointsTo != null) {
        currentPackage = subpackagesMap[currentPackage.pointsTo];
        subpackageId = currentPackage?.pointsTo;
    }

    if (currentPackage == null) {
        throw new Error("Package points to a non-existent subpackage");
    }

    let items = [...(package_?.items ?? [])];

    items = items.map((item) => {
        if (item.type === "subpackage" && item.subpackageId != null && subpackagesMap[item.subpackageId] != null) {
            const transformedPackage = flattenPackage(
                item,
                visitedEndpoints,
                visitedWebsockets,
                visitedWebhooks,
                visitedSubpackages,
                item.subpackageId,
                subpackagesMap[item.subpackageId],
                subpackagesMap,
                item.slug,
                domain,
            );
            return {
                type: "subpackage",
                ...transformedPackage,
            };
        }
        return item;
    });

    const methodAndPathToEndpoint = new Map<string, FlattenedEndpointDefinition>();
    items.forEach((item) => {
        if (item.type === "endpoint") {
            methodAndPathToEndpoint.set(`${item.method} ${stringifyEndpointPathParts(item.path.parts)}`, item);
        }
    });
    currentPackage.endpoints.forEach((endpoint) => {
        const endpointLocator = subpackageId != null ? `${subpackageId}.${endpoint.id}` : endpoint.id;
        if (visitedEndpoints.has(endpointLocator)) {
            return;
        }
        const flattenedEndpoint = toFlattenedEndpoint(endpoint, {
            icon: undefined,
            hidden: false,
            slug: [...parentSlugs, endpoint.urlSlug],
        });
        const methodAndPath = `${endpoint.method} ${stringifyEndpointPathParts(endpoint.path.parts)}`;
        const existingEndpoint = methodAndPathToEndpoint.get(methodAndPath);

        if (existingEndpoint != null) {
            if (existingEndpoint.stream == null && isStreamResponse(flattenedEndpoint.response)) {
                existingEndpoint.stream = flattenedEndpoint;
                flattenedEndpoint.name = nameWithStreamSuffix(existingEndpoint.name);
                return;
            } else if (isStreamResponse(existingEndpoint.response) && !isStreamResponse(flattenedEndpoint.response)) {
                const idx = items.indexOf(existingEndpoint);
                if (idx !== -1) {
                    flattenedEndpoint.stream = existingEndpoint;
                    existingEndpoint.name = nameWithStreamSuffix(flattenedEndpoint.name);
                    // replace the existing endpoint with the new one
                    items[idx] = flattenedEndpoint;
                    return;
                }
            }
        }

        items.push(flattenedEndpoint);
        methodAndPathToEndpoint.set(methodAndPath, flattenedEndpoint);
    });

    currentPackage.websockets.forEach((websocket) => {
        const websocketLocator = subpackageId != null ? `${subpackageId}.${websocket.id}` : websocket.id;
        if (visitedWebsockets.has(websocketLocator)) {
            return;
        }
        items.push(
            toFlattenedWebSocketChannel(websocket, {
                icon: undefined,
                hidden: false,
                slug: [...parentSlugs, websocket.urlSlug],
            }),
        );
    });

    currentPackage.webhooks.forEach((webhook) => {
        const webhookLocator = subpackageId != null ? `${subpackageId}.${webhook.id}` : webhook.id;
        if (visitedWebhooks.has(webhookLocator)) {
            return;
        }
        items.push(
            toFlattenedWebhookDefinition(webhook, {
                icon: undefined,
                hidden: false,
                slug: [...parentSlugs, webhook.urlSlug],
            }),
        );
    });

    currentPackage.subpackages.map((subpackageId) => {
        const subpackage = subpackagesMap[subpackageId];
        if (subpackage == null) {
            return;
        }
        const subpackageSlugs = [...parentSlugs, subpackage.urlSlug];
        const unorderedSubpackage = flattenPackage(
            undefined,
            visitedEndpoints,
            visitedWebsockets,
            visitedWebhooks,
            visitedSubpackages,
            subpackageId,
            subpackage,
            subpackagesMap,
            subpackageSlugs,
            domain,
        );
        items.push({
            type: "subpackage",
            ...unorderedSubpackage,
        });
    });

    return {
        title: "",
        description: undefined,
        icon: undefined,
        hidden: false,
        subpackageId: undefined,
        summaryPageId: undefined,
        slug: parentSlugs,
        ...package_,
        items,
    };
}

// function maybeMergeSubpackages(subpackages: FlattenedSubpackage[], domain: string): FlattenedSubpackage[] {
//     if (domain.includes("assemblyai")) {
//         const realtimeIdx = subpackages.findIndex((subpackage) => subpackage.subpackageId === "subpackage_realtime");
//         const realtime = subpackages[realtimeIdx];
//         if (realtime != null) {
//             const subpackageIdx = subpackages.findIndex(
//                 (subpackage) => subpackage.subpackageId === "subpackage_streaming",
//             );
//             if (subpackageIdx !== -1) {
//                 const subpackage = subpackages[subpackageIdx];
//                 subpackages.splice(subpackageIdx, 1, {
//                     ...subpackage,
//                     items: [...realtime.items, ...subpackage.items],
//                 });
//                 subpackages.splice(realtimeIdx, 1);
//             }
//         }
//     }
//     return subpackages;
// }

function isStreamResponse(response: APIV1Read.HttpResponse | undefined) {
    if (response == null) {
        return false;
    }
    return visitDiscriminatedUnion(response.type, "type")._visit<boolean>({
        object: () => false,
        reference: () => false,
        fileDownload: () => false,
        streamingText: () => true,
        stream: () => true,
        streamCondition: () => true,
        _other: () => false,
    });
}

function nameWithStreamSuffix(name: string) {
    return name.toLowerCase().includes("stream") ? name : `${name} Stream`;
}
