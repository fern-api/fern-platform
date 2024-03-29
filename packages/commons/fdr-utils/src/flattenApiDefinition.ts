import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, noop, titleCase, visitDiscriminatedUnion } from "@fern-ui/core-utils";

export interface FlattenedParameter {
    key: string;
    type: APIV1Read.TypeReference;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
}

export interface FlattenedEndpointDefinition {
    type: "endpoint";
    id: string;
    slug: string[];
    name: string | undefined;
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
}

export interface FlattenedWebSocketChannel {
    type: "websocket";
    id: string;
    slug: string[];
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

export interface FlattenedWebhookDefinition {
    type: "webhook";
    id: string;
    slug: string[];
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
    subpackageId: string;
    description: string | undefined;
}

export function isFlattenedSubpackage(package_: FlattenedApiDefinitionPackage): package_ is FlattenedSubpackage {
    return (package_ as FlattenedSubpackage).type === "subpackage";
}

export interface FlattenedNavigationItems {
    type: "navigationItems";
    items: DocsV1Read.ApiNavigationConfigItem.NavigationItem[];
}

export type FlattenedApiDefinitionPackageItem =
    | FlattenedEndpointDefinition
    | FlattenedWebSocketChannel
    | FlattenedWebhookDefinition
    | FlattenedSubpackage
    | FlattenedNavigationItems;

export const FlattenedApiDefinitionPackageItem = {
    visit: <T>(
        item: FlattenedApiDefinitionPackageItem,
        visitor: {
            endpoint: (endpoint: FlattenedEndpointDefinition) => T;
            websocket: (websocket: FlattenedWebSocketChannel) => T;
            webhook: (webhook: FlattenedWebhookDefinition) => T;
            subpackage: (subpackage: FlattenedSubpackage) => T;
            navigationItems: (navigationItems: FlattenedNavigationItems) => T;
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
            case "navigationItems":
                return visitor.navigationItems(item);
        }
    },
    isSubpackage: (item: FlattenedApiDefinitionPackageItem): item is FlattenedSubpackage => item.type === "subpackage",
    isEndpoint: (item: FlattenedApiDefinitionPackageItem): item is FlattenedEndpointDefinition =>
        item.type === "endpoint",
    isWebSocket: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebSocketChannel =>
        item.type === "websocket",
    isWebhook: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebhookDefinition => item.type === "webhook",
    isNavigationItem: (item: FlattenedApiDefinitionPackageItem): item is FlattenedNavigationItems =>
        item.type === "navigationItems",
};

export interface FlattenedApiSummaryPage {
    id: DocsV1Read.PageId;
    title: string;
    description: string | undefined;
    icon: string | undefined;
}

export interface FlattenedApiDefinitionPackage {
    name: string; // api name, or subpackage name
    summary: FlattenedApiSummaryPage | undefined;
    items: FlattenedApiDefinitionPackageItem[];
    slug: readonly string[];
    usedTypes: readonly string[];
}

export interface FlattenedApiDefinition extends FlattenedApiDefinitionPackage {
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, APIV1Read.TypeDefinition>;
    globalHeaders: APIV1Read.Header[];
}

export function flattenApiDefinition(
    apiDefinition: APIV1Read.ApiDefinition,
    parentSlugs: readonly string[],
    navigation: DocsV1Read.ApiNavigationConfigRoot | undefined,
    name: string,
): FlattenedApiDefinition {
    const package_ = flattenPackage(
        apiDefinition.rootPackage,
        apiDefinition.subpackages,
        parentSlugs,
        navigation ?? apiDefinition.navigation,
        name,
    );

    return {
        api: apiDefinition.id,
        auth: apiDefinition.auth,
        types: apiDefinition.types,
        globalHeaders: apiDefinition.globalHeaders ?? [],
        ...package_,
    };
}

function flattenPackage(
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: readonly string[],
    subpackageInfo: DocsV1Read.ApiNavigationConfigRoot | DocsV1Read.ApiNavigationConfigItem.Subpackage | undefined,
    name: string,
): FlattenedApiDefinitionPackage {
    let currentPackage: APIV1Read.ApiDefinitionPackage | undefined = apiDefinitionPackage;
    while (currentPackage?.pointsTo != null) {
        currentPackage = subpackagesMap[currentPackage.pointsTo];
    }

    if (currentPackage == null) {
        return {
            summary: undefined,
            items: [],
            slug: parentSlugs,
            usedTypes: [],
            name,
        };
    }

    let endpoints = currentPackage.endpoints.map(
        (endpoint): FlattenedEndpointDefinition => ({
            type: "endpoint",
            id: endpoint.id,
            slug: [...parentSlugs, endpoint.urlSlug],
            name: endpoint.name,
            description: endpoint.description,
            availability: endpoint.availability,
            authed: endpoint.authed,
            defaultEnvironment: endpoint.environments.find(
                (enironment) => enironment.id === endpoint.defaultEnvironment,
            ),
            environments: endpoint.environments,
            method: endpoint.method,
            path: endpoint.path,
            queryParameters: endpoint.queryParameters,
            headers: endpoint.headers,
            request: endpoint.request,
            response: endpoint.response,
            errors: endpoint.errorsV2 ?? [],
            examples: endpoint.examples,
        }),
    );

    let websockets = currentPackage.websockets.map(
        (websocket): FlattenedWebSocketChannel => ({
            type: "websocket",
            id: websocket.id,
            slug: [...parentSlugs, websocket.urlSlug],
            name: websocket.name,
            description: websocket.description,
            availability: websocket.availability,
            authed: websocket.auth,
            defaultEnvironment: websocket.environments.find(
                (enironment) => enironment.id === websocket.defaultEnvironment,
            ),
            environments: websocket.environments,
            path: websocket.path,
            headers: websocket.headers,
            queryParameters: websocket.queryParameters,
            messages: websocket.messages,
            examples: websocket.examples,
        }),
    );

    let webhooks = currentPackage.webhooks.map(
        (webhook): FlattenedWebhookDefinition => ({
            type: "webhook",
            id: webhook.id,
            slug: [...parentSlugs, webhook.urlSlug],
            name: webhook.name,
            description: webhook.description,
            availability: undefined,
            method: webhook.method,
            path: webhook.path,
            headers: webhook.headers,
            payload: webhook.payload,
            examples: webhook.examples,
        }),
    );

    let subpackages = currentPackage.subpackages
        .map((subpackageId): FlattenedSubpackage | undefined => {
            const subpackage = subpackagesMap[subpackageId];
            if (subpackage == null) {
                return;
            }
            const subpackageSlugs = [...parentSlugs, subpackage.urlSlug];
            const innerSubpackageInfo = subpackageInfo?.items
                ?.filter((item): item is APIV1Read.ApiNavigationConfigItem.Subpackage => item.type === "subpackage")
                .find((item) => item.subpackageId === subpackageId);
            const name = subpackage.displayName ?? titleCase(subpackage.name);
            return {
                type: "subpackage",
                subpackageId: subpackage.subpackageId,
                description: subpackage.description,
                ...flattenPackage(subpackage, subpackagesMap, subpackageSlugs, innerSubpackageInfo, name),
            };
        })
        .filter(isNonNullish);

    const items: FlattenedApiDefinitionPackageItem[] = [];

    for (const item of subpackageInfo?.items ?? []) {
        visitDiscriminatedUnion(item, "type")._visit({
            subpackage: (subpackage) => {
                const subpackageItem = subpackages.find((s) => s.subpackageId === subpackage.subpackageId);
                if (subpackageItem != null) {
                    subpackages = subpackages.filter((s) => s.subpackageId !== subpackage.subpackageId);
                }
            },
            navigationItem: (navigationItem) => {
                const lastItem = items[items.length - 1];
                if (lastItem == null || lastItem.type !== "navigationItems") {
                    items.push({ type: "navigationItems", items: [navigationItem] });
                } else {
                    lastItem.items.push(navigationItem);
                }
            },
            endpointId: ({ value: endpointId }) => {
                const endpoint = endpoints.find((endpoint) => endpoint.id === endpointId);
                if (endpoint != null) {
                    items.push(endpoint);
                    endpoints = endpoints.filter((endpoint) => endpoint.id !== endpointId);
                }
            },
            websocketId: ({ value: websocketId }) => {
                const websocket = websockets.find((websocket) => websocket.id === websocketId);
                if (websocket != null) {
                    items.push(websocket);
                    websockets = websockets.filter((websocket) => websocket.id !== websocketId);
                }
            },
            webhookId: ({ value: webhookId }) => {
                const webhook = webhooks.find((webhook) => webhook.id === webhookId);
                if (webhook != null) {
                    items.push(webhook);
                    webhooks = webhooks.filter((webhook) => webhook.id !== webhookId);
                }
            },
            _other: noop,
        });
    }

    // add remaining items
    items.push(...endpoints, ...websockets, ...webhooks, ...subpackages);

    return {
        items,
        slug: parentSlugs,
        usedTypes: currentPackage.types,
        summary:
            subpackageInfo?.summary != null
                ? { description: undefined, icon: undefined, ...subpackageInfo.summary }
                : undefined,
        name,
    };
}
