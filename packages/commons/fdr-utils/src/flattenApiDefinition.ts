import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, titleCase } from "@fern-ui/core-utils";

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
    name: string;
    description: string | undefined;
}

export function isFlattenedSubpackage(package_: FlattenedApiDefinitionPackage): package_ is FlattenedSubpackage {
    return (package_ as FlattenedSubpackage).type === "subpackage";
}

export type FlattenedApiDefinitionPackageItem =
    | FlattenedEndpointDefinition
    | FlattenedWebSocketChannel
    | FlattenedWebhookDefinition
    | FlattenedSubpackage;

export const FlattenedApiDefinitionPackageItem = {
    visit: <T>(
        item: FlattenedApiDefinitionPackageItem,
        visitor: {
            endpoint: (endpoint: FlattenedEndpointDefinition) => T;
            websocket: (websocket: FlattenedWebSocketChannel) => T;
            webhook: (webhook: FlattenedWebhookDefinition) => T;
            subpackage: (subpackage: FlattenedSubpackage) => T;
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
        }
    },
    isSubpackage: (item: FlattenedApiDefinitionPackageItem): item is FlattenedSubpackage => item.type === "subpackage",
    isEndpoint: (item: FlattenedApiDefinitionPackageItem): item is FlattenedEndpointDefinition =>
        item.type === "endpoint",
    isWebSocket: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebSocketChannel =>
        item.type === "websocket",
    isWebhook: (item: FlattenedApiDefinitionPackageItem): item is FlattenedWebhookDefinition => item.type === "webhook",
};

export interface FlattenedApiDefinitionPackage {
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
): FlattenedApiDefinition {
    const package_ = flattenPackage(
        apiDefinition.rootPackage,
        apiDefinition.subpackages,
        parentSlugs,
        apiDefinition.navigation?.items,
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
    order: APIV1Read.ApiNavigationConfigItem[] | undefined,
): FlattenedApiDefinitionPackage {
    let currentPackage: APIV1Read.ApiDefinitionPackage | undefined = apiDefinitionPackage;
    while (currentPackage?.pointsTo != null) {
        currentPackage = subpackagesMap[currentPackage.pointsTo];
    }

    if (currentPackage == null) {
        return {
            items: [],
            slug: parentSlugs,
            usedTypes: [],
        };
    }

    const endpoints = currentPackage.endpoints.map(
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

    const websockets = currentPackage.websockets.map(
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

    const webhooks = currentPackage.webhooks.map(
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

    const subpackages = currentPackage.subpackages
        .map((subpackageId): FlattenedSubpackage | undefined => {
            const subpackage = subpackagesMap[subpackageId];
            if (subpackage == null) {
                return;
            }
            const subpackageSlugs = [...parentSlugs, subpackage.urlSlug];
            const subpackageOrder = order
                ?.filter((item): item is APIV1Read.ApiNavigationConfigItem.Subpackage => item.type === "subpackage")
                .find((item) => item.subpackageId === subpackageId)?.items;
            return {
                type: "subpackage",
                subpackageId: subpackage.subpackageId,
                name: titleCase(subpackage.name),
                description: subpackage.description,
                ...flattenPackage(subpackage, subpackagesMap, subpackageSlugs, subpackageOrder),
            };
        })
        .filter(isNonNullish);

    const items: FlattenedApiDefinitionPackageItem[] = [...endpoints, ...websockets, ...webhooks, ...subpackages];

    if (order != null && order.length > 0) {
        items.sort((a, b) => {
            const aIndex = order.findIndex((item) => {
                if (item.type === "subpackage" && a.type === "subpackage") {
                    return item.subpackageId === a.subpackageId;
                }

                if (item.type !== "subpackage" && a.type !== "subpackage") {
                    return item.value === a.id;
                }
                return false;
            });
            const bIndex = order.findIndex((item) => {
                if (item.type === "subpackage" && b.type === "subpackage") {
                    return item.subpackageId === b.subpackageId;
                }

                if (item.type !== "subpackage" && b.type !== "subpackage") {
                    return item.value === b.id;
                }
                return false;
            });

            if (aIndex === -1) {
                return 1;
            }
            if (bIndex === -1) {
                return -1;
            }
            return aIndex - bIndex;
        });
    }

    return {
        items,
        slug: parentSlugs,
        usedTypes: currentPackage.types,
    };
}
