import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, titleCase } from "@fern-ui/core-utils";

export interface FlattenedParameter {
    key: string;
    type: APIV1Read.TypeReference;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
}

export interface FlattenedEndpointDefinition {
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
    subpackageId: string;
    name: string;
    description: string | undefined;
}

export function isFlattenedSubpackage(package_: FlattenedApiDefinitionPackage): package_ is FlattenedSubpackage {
    return typeof (package_ as FlattenedSubpackage).subpackageId === "string";
}

export interface FlattenedApiDefinitionPackage {
    endpoints: FlattenedEndpointDefinition[];
    websockets: FlattenedWebSocketChannel[];
    webhooks: FlattenedWebhookDefinition[];
    subpackages: FlattenedSubpackage[];
    slug: readonly string[];
    usedTypes: readonly string[];
}

export interface FlattenedApiDefinition extends FlattenedApiDefinitionPackage {
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, APIV1Read.TypeDefinition>;
}

export function flattenApiDefinition(
    apiDefinition: APIV1Read.ApiDefinition,
    parentSlugs: readonly string[],
): FlattenedApiDefinition {
    const package_ = flattenPackage(apiDefinition.rootPackage, apiDefinition.subpackages, parentSlugs);

    return {
        api: apiDefinition.id,
        auth: apiDefinition.auth,
        types: apiDefinition.types,
        ...package_,
    };
}

function flattenPackage(
    apiDefinitionPackage: APIV1Read.ApiDefinitionPackage,
    subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    parentSlugs: readonly string[],
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
            usedTypes: [],
        };
    }

    return {
        endpoints: currentPackage.endpoints.map(
            (endpoint): FlattenedEndpointDefinition => ({
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
        ),
        websockets: currentPackage.websockets.map(
            (websocket): FlattenedWebSocketChannel => ({
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
        ),
        webhooks: currentPackage.webhooks.map(
            (webhook): FlattenedWebhookDefinition => ({
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
                    name: titleCase(subpackage.name),
                    description: subpackage.description,
                    ...flattenPackage(subpackage, subpackages, subpackageSlugs),
                };
            })
            .filter(isNonNullish),
        slug: parentSlugs,
        usedTypes: currentPackage.types,
    };
}
