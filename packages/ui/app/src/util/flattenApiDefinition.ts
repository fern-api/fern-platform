import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish } from "@fern-ui/core-utils";

export interface FlattenedParameter {
    key: string;
    type: APIV1Read.TypeReference;
    description: string | null;
    availability: APIV1Read.Availability | null;
}

export interface FlattenedEndpointDefinition {
    id: string;
    slug: string[];
    name: string | null;
    description: string | null;
    availability: APIV1Read.Availability | null;
    authed: boolean;
    defaultEnvironment: APIV1Read.Environment | null;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    path: APIV1Read.EndpointPath;
    queryParameters: APIV1Read.QueryParameter[];
    headers: APIV1Read.Header[];
    request: APIV1Read.HttpRequest | null;
    response: APIV1Read.HttpResponse | null;
    errors: APIV1Read.ErrorDeclarationV2[];
    examples: APIV1Read.ExampleEndpointCall[];
}

export interface FlattenedWebSocketChannel {
    id: string;
    slug: string[];
    name: string | null;
    description: string | null;
    availability: APIV1Read.Availability | null;
    authed: boolean;
    defaultEnvironment: APIV1Read.Environment | null;
    environments: APIV1Read.Environment[];
    path: APIV1Read.EndpointPath;
    headers: APIV1Read.Header[];
    queryParameters: APIV1Read.QueryParameter[];
    messages: APIV1Read.WebSocketMessage[];
    examples: APIV1Read.ExampleWebSocketSession[];
}

export interface FlattenedWebhookDefinition {
    id: string;
    slug: string[];
    name: string | null;
    description: string | null;
    availability: APIV1Read.Availability | null;
    method: APIV1Read.WebhookHttpMethod;
    path: string[];
    headers: APIV1Read.Header[];
    payload: APIV1Read.WebhookPayload;
    examples: APIV1Read.ExampleWebhookPayload[];
}

export interface FlattenedSubpackage extends FlattenedApiDefinitionPackage {
    subpackageId: string;
    name: string;
    description: string | null;
}

export function isFlattenedSubpackage(package_: FlattenedApiDefinitionPackage): package_ is FlattenedSubpackage {
    return typeof (package_ as FlattenedSubpackage).subpackageId === "string";
}

export interface FlattenedApiDefinitionPackage {
    endpoints: FlattenedEndpointDefinition[];
    websockets: FlattenedWebSocketChannel[];
    webhooks: FlattenedWebhookDefinition[];
    subpackages: FlattenedSubpackage[];
    slug: string[];
}

export interface FlattenedApiDefinition extends FlattenedApiDefinitionPackage {
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | null;
    types: Record<string, APIV1Read.TypeDefinition>;
}

export function flattenApiDefinition(
    apiDefinition: APIV1Read.ApiDefinition,
    parentSlugs: string[],
): FlattenedApiDefinition {
    const package_ = flattenPackage(apiDefinition.rootPackage, apiDefinition.subpackages, parentSlugs);

    return {
        api: apiDefinition.id,
        auth: apiDefinition.auth ?? null,
        types: apiDefinition.types,
        ...package_,
    };
}

function flattenPackage(
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage,
    subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: string[],
): FlattenedApiDefinitionPackage {
    let currentPackage: APIV1Read.ApiDefinitionPackage | undefined = apiDefinitionPackage;
    while (currentPackage?.pointsTo != null) {
        currentPackage = subpackages[currentPackage.pointsTo];
    }

    if (currentPackage == null) {
        return {
            endpoints: [],
            websockets: [],
            webhooks: [],
            subpackages: [],
            slug: parentSlugs,
        };
    }

    return {
        endpoints: currentPackage.endpoints.map(
            (endpoint): FlattenedEndpointDefinition => ({
                id: endpoint.id,
                slug: [...parentSlugs, endpoint.urlSlug],
                name: endpoint.name ?? null,
                description: endpoint.description ?? null,
                availability: endpoint.availability ?? null,
                authed: endpoint.authed,
                defaultEnvironment:
                    endpoint.environments.find((enironment) => enironment.id === endpoint.defaultEnvironment) ?? null,
                environments: endpoint.environments,
                method: endpoint.method,
                path: endpoint.path,
                queryParameters: endpoint.queryParameters,
                headers: endpoint.headers,
                request: endpoint.request ?? null,
                response: endpoint.response ?? null,
                errors: endpoint.errorsV2 ?? [],
                examples: endpoint.examples,
            }),
        ),
        websockets: currentPackage.websockets.map(
            (websocket): FlattenedWebSocketChannel => ({
                id: websocket.id,
                slug: [...parentSlugs, websocket.urlSlug],
                name: websocket.name ?? null,
                description: websocket.description ?? null,
                availability: websocket.availability ?? null,
                authed: websocket.auth,
                defaultEnvironment:
                    websocket.environments.find((enironment) => enironment.id === websocket.defaultEnvironment) ?? null,
                environments: websocket.environments,
                path: websocket.path,
                headers: websocket.headers,
                queryParameters: websocket.queryParameters,
                messages: websocket.messages,
                examples: websocket.examples,
            }),
        ),
        webhooks: currentPackage.webhooks.map(
            (webhook): FlattenedWebhookDefinition => ({
                id: webhook.id,
                slug: [...parentSlugs, webhook.urlSlug],
                name: webhook.name ?? null,
                description: webhook.description ?? null,
                availability: null,
                method: webhook.method,
                path: webhook.path,
                headers: webhook.headers,
                payload: webhook.payload,
                examples: webhook.examples,
            }),
        ),
        subpackages: currentPackage.subpackages
            .map((subpackageId): FlattenedSubpackage | undefined => {
                const subpackage = subpackages[subpackageId];
                if (subpackage == null) {
                    return;
                }
                const subpackageSlugs = [...parentSlugs, subpackage.urlSlug];
                return {
                    subpackageId: subpackage.subpackageId,
                    name: subpackage.name,
                    description: subpackage.description ?? null,
                    ...flattenPackage(subpackage, subpackages, subpackageSlugs),
                };
            })
            .filter(isNonNullish),
        slug: parentSlugs,
    };
}
