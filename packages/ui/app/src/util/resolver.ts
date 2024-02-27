import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { WithoutQuestionMarks } from "@fern-api/fdr-sdk/dist/converters/utils/WithoutQuestionMarks";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { mapValues, pick, sortBy } from "lodash-es";
import {
    endpointExampleToHttpRequestExample,
    sortKeysByShape,
    stringifyHttpRequestExampleToCurl,
} from "../api-page/examples/types";
import { trimCode } from "../commons/FernSyntaxHighlighter";
import {
    FlattenedApiDefinition,
    FlattenedApiDefinitionPackage,
    FlattenedEndpointDefinition,
    FlattenedSubpackage,
    FlattenedWebhookDefinition,
    FlattenedWebSocketChannel,
} from "./flattenApiDefinition";
import { titleCase } from "./titleCase";

type WithDescription = { description: string | undefined };
type WithAvailability = { availability: APIV1Read.Availability | undefined };

// export async function resolveNavigationItems(
//     navigationItems: DocsV1Read.NavigationItem[],
//     apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
//     parentSlugs: string[] = [],
// ): Promise<ResolvedNavigationItem[]> {
//     const highlighter = await getHighlighterInstance();
//     return resolveNavigationItemsInternal(navigationItems, apis, highlighter, parentSlugs);
// }

// function resolveNavigationItemsInternal(
//     navigationItems: DocsV1Read.NavigationItem[],
//     apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
//     highlighter: Highlighter,
//     parentSlugs: string[] = [],
// ): ResolvedNavigationItemApiSection[] {
//     const resolvedNavigationItems: ResolvedNavigationItemApiSection[] = [];

//     for (const navigationItem of navigationItems) {
//         visitDiscriminatedUnion(navigationItem, "type")._visit({
//             page: noop,
//             api: (api) => {
//                 const definition = apis[api.api];
//                 if (definition != null) {
//                     const definitionSlug = api.skipUrlSlug ? parentSlugs : [...parentSlugs, api.urlSlug];
//                     const resolvedTypes = mapValues(definition.types, (type) =>
//                         resolveTypeDefinition(type, definition.types),
//                     );

//                     const { endpoints, webhooks, subpackages, websockets } = resolveApiDefinitionPackage(
//                         definition.auth,
//                         api.api,
//                         api.api,
//                         definition.rootPackage,
//                         definition.subpackages,
//                         definition.types,
//                         resolvedTypes,
//                         definitionSlug,
//                         highlighter,
//                     );

//                     resolvedNavigationItems.push({
//                         api: api.api,
//                         title: api.title,
//                         skipUrlSlug: api.skipUrlSlug,
//                         artifacts: api.artifacts ,
//                         showErrors: api.showErrors,
//                         type: "apiSection",
//                         auth: definition.auth ,
//                         hasMultipleBaseUrls: definition.hasMultipleBaseUrls ,
//                         slug: definitionSlug,
//                         endpoints,
//                         websockets,
//                         webhooks,
//                         subpackages,
//                         types: resolvedTypes,
//                     });
//                 }
//             },
//             section: (section) => {
//                 const sectionSlug = [...parentSlugs, section.urlSlug];
//                 resolvedNavigationItems.push(
//                     ...resolveNavigationItemsInternal(
//                         section.items,
//                         apis,
//                         highlighter,
//                         section.skipUrlSlug ? parentSlugs : sectionSlug,
//                     ),
//                 );
//             },
//             link: noop,
//             _other: noop,
//         });
//     }

//     return resolvedNavigationItems;
// }

export function resolveApiDefinition(
    apiDefinition: FlattenedApiDefinition,
    filteredTypes?: string[],
): ResolvedRootPackage {
    // const highlighter = await getHighlighterInstance();

    const resolvedTypes = mapValues(
        filteredTypes != null ? pick(apiDefinition.types, filteredTypes) : apiDefinition.types,
        (type) => resolveTypeDefinition(type, apiDefinition.types),
    );

    const withPackage = resolveApiDefinitionPackage(
        apiDefinition.auth,
        apiDefinition.api,
        apiDefinition.api,
        apiDefinition,
        apiDefinition.types,
        resolvedTypes,
        // highlighter,
    );
    return {
        type: "rootPackage",
        ...withPackage,
        api: apiDefinition.api,
        auth: apiDefinition.auth,
        types: resolvedTypes,
    };
}

function resolveApiDefinitionPackage(
    auth: APIV1Read.ApiAuth | undefined,
    apiSectionId: FdrAPI.ApiDefinitionId,
    id: APIV1Read.SubpackageId,
    package_: FlattenedApiDefinitionPackage | undefined,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): ResolvedWithApiDefinition {
    if (package_ == null) {
        return {
            endpoints: [],
            webhooks: [],
            websockets: [],
            subpackages: [],
            slug: [],
        };
    }

    const endpoints = mergeContentTypes(
        package_.endpoints.map((endpoint) =>
            resolveEndpointDefinition(auth, apiSectionId, id, endpoint, types, resolvedTypes),
        ),
    );
    const websockets = package_.websockets.map((websocket) => resolveWebsocketChannel(websocket, types));
    const webhooks = package_.webhooks.map((webhook) => resolveWebhookDefinition(webhook, types, resolvedTypes));
    const subpackages = package_.subpackages
        .map((subpackage) => resolveSubpackage(auth, apiSectionId, subpackage, types, resolvedTypes))
        .filter(isNonNullish);

    return {
        endpoints,
        webhooks,
        websockets,
        subpackages,
        slug: package_.slug,
    };
}

function resolveSubpackage(
    auth: APIV1Read.ApiAuth | undefined,
    apiSectionId: FdrAPI.ApiDefinitionId,
    subpackage: FlattenedSubpackage,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): ResolvedSubpackage | undefined {
    const { endpoints, webhooks, subpackages, websockets } = resolveApiDefinitionPackage(
        auth,
        apiSectionId,
        subpackage.subpackageId,
        subpackage,
        types,
        resolvedTypes,
        // highlighter,
    );

    if (
        subpackage == null ||
        (endpoints.length === 0 && webhooks.length === 0 && subpackages.length === 0 && websockets.length === 0)
    ) {
        return undefined;
    }
    return {
        name: subpackage.name,
        description: subpackage.description,
        title: titleCase(subpackage.name),
        type: "subpackage",
        apiSectionId,
        id: subpackage.subpackageId,
        slug: subpackage.slug,
        endpoints,
        websockets,
        webhooks,
        subpackages,
    };
}

function resolveEndpointDefinition(
    auth: APIV1Read.ApiAuth | undefined,
    apiSectionId: FdrAPI.ApiDefinitionId,
    apiPackageId: FdrAPI.ApiDefinitionId,
    endpoint: FlattenedEndpointDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): ResolvedEndpointDefinition {
    const pathParameters = endpoint.path.pathParameters.map(
        (parameter): ResolvedObjectProperty => ({
            key: parameter.key,
            valueShape: resolveTypeReference(parameter.type, types),
            description: parameter.description,
            availability: parameter.availability,
        }),
    );
    const path = endpoint.path.parts.map((pathPart): ResolvedEndpointPathParts => {
        if (pathPart.type === "literal") {
            return pathPart;
        } else {
            const parameter = pathParameters.find((parameter) => parameter.key === pathPart.value);
            if (parameter == null) {
                return {
                    type: "pathParameter",
                    key: pathPart.value,
                    valueShape: { type: "unknown" },
                    description: undefined,
                    availability: undefined,
                };
            }
            return {
                ...parameter,
                type: "pathParameter",
            };
        }
    });
    const toRet: ResolvedEndpointDefinition = {
        name: endpoint.name,
        id: endpoint.id,
        slug: endpoint.slug,
        description: endpoint.description,
        authed: endpoint.authed,
        availability: endpoint.availability,
        apiSectionId,
        apiPackageId,
        environments: endpoint.environments,
        method: endpoint.method,
        examples: [],
        title: endpoint.name != null ? endpoint.name : stringifyResolvedEndpointPathParts(path),
        defaultEnvironment: endpoint.defaultEnvironment,
        path,
        pathParameters,
        queryParameters: endpoint.queryParameters.map((parameter) => ({
            key: parameter.key,
            valueShape: resolveTypeReference(parameter.type, types),
            description: parameter.description,
            availability: parameter.availability,
        })),
        headers: endpoint.headers.map((header) => ({
            key: header.key,
            valueShape: resolveTypeReference(header.type, types),
            description: header.description,
            availability: header.availability,
        })),
        requestBody:
            endpoint.request != null
                ? [
                      {
                          contentType: endpoint.request.contentType,
                          shape: resolveRequestBodyShape(endpoint.request.type, types),
                          description: endpoint.request.description,
                      },
                  ]
                : [],
        responseBody:
            endpoint.response != null
                ? {
                      shape: resolveResponseBodyShape(endpoint.response.type, types),
                      description: endpoint.response.description,
                  }
                : undefined,
        errors: endpoint.errors.map(
            (error): ResolvedError => ({
                statusCode: error.statusCode,
                name: error.name,
                shape:
                    error.type != null
                        ? resolveTypeShape(undefined, error.type, types, undefined, undefined)
                        : undefined,
                description: error.description,
                availability: error.availability,
            }),
        ),
    };

    toRet.examples = endpoint.examples.map((example) => {
        const requestBody = resolveExampleEndpointRequest(
            example.requestBodyV3,
            toRet.requestBody[0]?.shape,
            resolvedTypes,
        );
        const responseBody = resolveExampleEndpointResponse(
            example.responseBodyV3,
            toRet.responseBody?.shape,
            resolvedTypes,
        );
        return {
            name: example.name,
            description: example.description,
            path: example.path,
            pathParameters: example.pathParameters,
            queryParameters: example.queryParameters,
            headers: example.headers,
            requestBody,
            responseStatusCode: example.responseStatusCode,
            responseBody,
            // TODO: handle this differently for streaming/file responses
            // responseHast:
            //     responseBody != null
            //         ? highlight(highlighter, JSON.stringify(responseBody.value, undefined, 2), "json")
            //         : undefined,
            snippets: resolveCodeSnippets(endpoint.authed ? auth : undefined, toRet, example, requestBody),
        };
    });

    return toRet;
}

function resolveWebsocketChannel(
    websocket: FlattenedWebSocketChannel,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedWebSocketChannel {
    const pathParameters = websocket.path.pathParameters.map(
        (parameter): ResolvedObjectProperty => ({
            key: parameter.key,
            valueShape: resolveTypeReference(parameter.type, types),
            description: parameter.description,
            availability: parameter.availability,
        }),
    );
    return {
        authed: websocket.authed,
        environments: websocket.environments,
        id: websocket.id,
        description: websocket.description,
        availability: websocket.availability,
        slug: websocket.slug,
        name: websocket.name,
        path: websocket.path.parts
            .map((pathPart): ResolvedEndpointPathParts | undefined => {
                if (pathPart.type === "literal") {
                    return { ...pathPart };
                } else {
                    const correspondingParameter = pathParameters.find((param) => param.key === pathPart.value);
                    if (correspondingParameter === undefined) {
                        // eslint-disable-next-line no-console
                        console.error(
                            "Path parameter contained within path.parts not found within websocket.path.pathParameters",
                        );
                        return;
                    } else {
                        return { ...pathPart, ...correspondingParameter };
                    }
                }
            })
            .filter((param) => param !== undefined) as ResolvedEndpointPathParts[],
        headers: websocket.headers.map((header) => ({
            key: header.key,
            valueShape: resolveTypeReference(header.type, types),
            description: header.description,
            availability: header.availability,
        })),
        pathParameters,
        queryParameters: websocket.queryParameters.map(
            (parameter): ResolvedObjectProperty => ({
                key: parameter.key,
                valueShape: resolveTypeReference(parameter.type, types),
                description: parameter.description,
                availability: parameter.availability,
            }),
        ),
        messages: websocket.messages.map(({ body, ...message }) => ({
            ...message,
            body: resolvePayloadShape(body, types),
        })),
        examples: websocket.examples,
        defaultEnvironment: websocket.defaultEnvironment,
    };
}

function resolveWebhookDefinition(
    webhook: FlattenedWebhookDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): ResolvedWebhookDefinition {
    const payloadShape = resolvePayloadShape(webhook.payload.type, types);
    return {
        name: webhook.name,
        description: webhook.description,
        slug: webhook.slug,
        method: webhook.method,
        id: webhook.id,
        path: webhook.path,
        headers: webhook.headers.map((header) => ({
            key: header.key,
            valueShape: resolveTypeReference(header.type, types),
            description: header.description,
            availability: header.availability,
        })),
        payload: {
            shape: payloadShape,
            description: webhook.payload.description,
        },
        examples: webhook.examples.map((example) => {
            const sortedPayload = stripUndefines(sortKeysByShape(example.payload, payloadShape, resolvedTypes));
            return {
                payload: sortedPayload,
                // hast: highlight(highlighter, JSON.stringify(sortedPayload, undefined, 2), "json"),
            };
        }),
    };
}

function resolvePayloadShape(
    payloadShape: APIV1Read.WebhookPayloadShape | APIV1Read.WebSocketMessageBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedTypeShape {
    return visitDiscriminatedUnion(payloadShape, "type")._visit<ResolvedTypeShape>({
        object: (object) => ({
            type: "object",
            name: undefined,
            extends: object.extends,
            properties: resolveObjectProperties(object, types),
            description: undefined,
            availability: undefined,
        }),
        reference: (reference) => resolveTypeReference(reference.value, types),
        _other: () => ({ type: "unknown" }),
    });
}

function resolveRequestBodyShape(
    requestBodyShape: APIV1Read.HttpRequestBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedHttpRequestBodyShape {
    return visitDiscriminatedUnion(requestBodyShape, "type")._visit<ResolvedHttpRequestBodyShape>({
        object: (object) => ({
            type: "object",
            name: undefined,
            extends: object.extends,
            properties: resolveObjectProperties(object, types),
            description: undefined,
            availability: undefined,
        }),
        fileUpload: (fileUpload) => fileUpload,
        reference: (reference) => resolveTypeReference(reference.value, types),
        _other: () => ({ type: "unknown" }),
    });
}

function resolveResponseBodyShape(
    responseBodyShape: APIV1Read.HttpResponseBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedHttpResponseBodyShape {
    return visitDiscriminatedUnion(responseBodyShape, "type")._visit<ResolvedHttpResponseBodyShape>({
        object: (object) => ({
            type: "object",
            name: undefined,
            extends: object.extends,
            properties: resolveObjectProperties(object, types),
            description: undefined,
            availability: undefined,
        }),
        fileDownload: (fileDownload) => fileDownload,
        streamingText: (streamingText) => streamingText,
        streamCondition: (streamCondition) => streamCondition,
        reference: (reference) => resolveTypeReference(reference.value, types),
        stream: () => ({ type: "unknown" }), //TODO IMPLEMENT
        _other: () => ({ type: "unknown" }),
    });
}

function resolveTypeDefinition(
    typeDefinition: APIV1Read.TypeDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
) {
    return resolveTypeShape(
        typeDefinition.name,
        typeDefinition.shape,
        types,
        typeDefinition.description,
        typeDefinition.availability,
    );
}

function resolveTypeShape(
    name: string | undefined,
    typeShape: APIV1Read.TypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
    description?: string,
    availability?: APIV1Read.Availability,
): ResolvedTypeDefinition {
    return visitDiscriminatedUnion(typeShape, "type")._visit<ResolvedTypeDefinition>({
        object: (object) => ({
            type: "object",
            name,
            extends: object.extends,
            properties: resolveObjectProperties(object, types),
            description,
            availability,
        }),
        enum: (enum_) => ({
            type: "enum",
            name,
            values: enum_.values.map((enumValue) => ({
                value: enumValue.value,
                description: enumValue.description,
            })),
            description,
            availability,
        }),
        undiscriminatedUnion: (undiscriminatedUnion) => ({
            type: "undiscriminatedUnion",
            name,
            variants: undiscriminatedUnion.variants.map((variant) => ({
                displayName: variant.displayName,
                shape: resolveTypeReference(variant.type, types),
                description: variant.description,
                availability: variant.availability,
            })),
            description,
            availability,
        }),
        alias: (alias) => ({
            type: "alias",
            name,
            shape: resolveTypeReference(alias.value, types),
            description,
            availability,
        }),
        discriminatedUnion: (discriminatedUnion) => {
            return {
                type: "discriminatedUnion",
                name,
                discriminant: discriminatedUnion.discriminant,
                variants: discriminatedUnion.variants.map((variant) => ({
                    discriminantValue: variant.discriminantValue,
                    extends: variant.additionalProperties.extends,
                    properties: resolveObjectProperties(variant.additionalProperties, types),
                    description: variant.description,
                    availability: variant.availability,
                })),
                description,
                availability,
            };
        },
        _other: () => ({ type: "unknown" }),
    });
}

function resolveTypeReference(
    typeReference: APIV1Read.TypeReference,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedTypeShape {
    return visitDiscriminatedUnion(typeReference, "type")._visit<ResolvedTypeShape>({
        literal: (literal) => literal.value,
        unknown: (unknown) => unknown,
        optional: (optional) => ({
            type: "optional",
            shape: unwrapOptionalRaw(resolveTypeReference(optional.itemType, types), types),
        }),
        list: (list) => ({ type: "list", shape: resolveTypeReference(list.itemType, types) }),
        set: (set) => ({ type: "set", shape: resolveTypeReference(set.itemType, types) }),
        map: (map) => ({
            type: "map",
            keyShape: resolveTypeReference(map.keyType, types),
            valueShape: resolveTypeReference(map.valueType, types),
        }),
        id: ({ value: typeId }) => {
            const typeDefinition = types[typeId];
            if (typeDefinition == null) {
                return { type: "unknown" };
            }
            return { type: "reference", typeId };
        },
        primitive: (primitive) => primitive.value,
        _other: () => ({ type: "unknown" }),
    });
}

export function dereferenceObjectProperties(
    object: ResolvedObjectShape | ResolvedDiscriminatedUnionShapeVariant,
    types: Record<string, ResolvedTypeDefinition>,
): ResolvedObjectProperty[] {
    const directProperties = object.properties;
    const extendedProperties = object.extends.flatMap((typeId) => {
        const referencedShape = types[typeId] ?? { type: "unknown" };
        const shape = unwrapReference(referencedShape, types);
        // TODO: should we be able to extend discriminated and undiscriminated unions?
        if (shape?.type !== "object") {
            // eslint-disable-next-line no-console
            console.error("Object extends non-object", typeId);
            return [];
        }
        return dereferenceObjectProperties(shape, types);
    });
    if (extendedProperties.length === 0) {
        // if there are no extended properties, we can just return the direct properties
        // required properties should come before optional properties
        // however, we do NOT sort the properties by key because the initial order of properties may be significant
        return sortBy(
            [...directProperties],
            (property) => unwrapReference(property.valueShape, types).type === "optional",
        );
    }
    const propertyKeys = new Set(object.properties.map((property) => property.key));
    const filteredExtendedProperties = extendedProperties.filter(
        (extendedProperty) => !propertyKeys.has(extendedProperty.key),
    );

    // required properties should come before optional properties
    // since there are extended properties, the initial order of properties are not significant, and we should sort by key
    return sortBy(
        [...directProperties, ...filteredExtendedProperties],
        (property) => unwrapReference(property.valueShape, types).type === "optional",
        (property) => property.key,
    );
}

function resolveObjectProperties(
    object: APIV1Read.ObjectType,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedObjectProperty[] {
    return object.properties.map(
        (property): ResolvedObjectProperty => ({
            key: property.key,
            valueShape: resolveTypeReference(property.valueType, types),
            description: property.description,
            availability: property.availability,
        }),
    );
}

export type ResolvedNavigationItem =
    | ResolvedNavigationItemPageGroup
    | ResolvedNavigationItemApiSection
    | ResolvedNavigationItemSection;

export interface ResolvedNavigationItemPageGroup {
    type: "pageGroup";
    pages: ResolvedPageMetadata[];
}

export interface ResolvedPageMetadata {
    id: DocsV1Read.PageId;
    slug: string[];
    title: string;
}

export interface ResolvedNavigationItemApiSection
    extends WithoutQuestionMarks<Omit<DocsV1Read.ApiSection, "urlSlug" | "artifacts">>,
        ResolvedWithApiDefinition {
    type: "apiSection";
    auth: APIV1Read.ApiAuth | undefined;
    hasMultipleBaseUrls: boolean | undefined;
    slug: string[];
    types: Record<string, ResolvedTypeDefinition>;
    artifacts: DocsV1Read.ApiArtifacts | undefined;
}

export interface FlattenedRootPackage {
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
    apiDefinitions: ResolvedApiDefinition[];
}

export function flattenRootPackage(rootPackage: ResolvedRootPackage): FlattenedRootPackage {
    function getApiDefinitions(apiPackage: ResolvedApiDefinitionPackage): ResolvedApiDefinition[] {
        return [
            ...apiPackage.endpoints.map(
                (endpoint): ResolvedApiDefinition.Endpoint => ({
                    type: "endpoint" as const,
                    ...endpoint,
                    package: apiPackage,
                }),
            ),
            ...apiPackage.websockets.map(
                (websocket): ResolvedApiDefinition.WebSocket => ({
                    type: "websocket" as const,
                    ...websocket,
                    package: apiPackage,
                }),
            ),
            ...apiPackage.webhooks.map(
                (webhook): ResolvedApiDefinition.Webhook => ({
                    type: "webhook" as const,
                    ...webhook,
                    package: apiPackage,
                }),
            ),
            ...apiPackage.subpackages.flatMap(getApiDefinitions),
        ];
    }

    return {
        auth: rootPackage.auth,
        types: rootPackage.types,
        apiDefinitions: getApiDefinitions(rootPackage),
    };
}

export function isResolvedNavigationItemApiSection(
    item: ResolvedNavigationItem,
): item is ResolvedNavigationItemApiSection {
    return item.type === "apiSection";
}

export function crawlResolvedNavigationItemApiSections(
    items: ResolvedNavigationItem[],
): ResolvedNavigationItemApiSection[] {
    const packages: ResolvedNavigationItemApiSection[] = [];
    for (const item of items) {
        if (isResolvedNavigationItemApiSection(item)) {
            packages.push(item);
        } else if (item.type === "section") {
            packages.push(...crawlResolvedNavigationItemApiSections(item.items));
        }
    }
    return packages;
}

export interface ResolvedNavigationItemSection extends Omit<DocsV1Read.DocsSection, "items" | "urlSlug"> {
    type: "section";
    items: ResolvedNavigationItem[];
    slug: string[];
}

export function isResolvedNavigationItemSection(item: ResolvedNavigationItem): item is ResolvedNavigationItemSection {
    return item.type === "section";
}

export interface ResolvedWithApiDefinition {
    endpoints: ResolvedEndpointDefinition[];
    websockets: ResolvedWebSocketChannel[];
    webhooks: ResolvedWebhookDefinition[];
    subpackages: ResolvedSubpackage[];
    slug: string[];
}

export type ResolvedApiDefinition =
    | ResolvedApiDefinition.Endpoint
    | ResolvedApiDefinition.Webhook
    | ResolvedApiDefinition.WebSocket;

export declare namespace ResolvedApiDefinition {
    export interface Endpoint extends ResolvedEndpointDefinition {
        type: "endpoint";
        package: ResolvedApiDefinitionPackage;
    }

    export interface Webhook extends ResolvedWebhookDefinition {
        type: "webhook";
        package: ResolvedApiDefinitionPackage;
    }

    export interface WebSocket extends ResolvedWebSocketChannel {
        type: "websocket";
        package: ResolvedApiDefinitionPackage;
    }
}

export function isEndpoint(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.Endpoint {
    return definition.type === "endpoint";
}

export function isWebhook(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.Webhook {
    return definition.type === "webhook";
}

export function isWebSocket(definition: ResolvedApiDefinition): definition is ResolvedApiDefinition.WebSocket {
    return definition.type === "websocket";
}

export interface ResolvedSubpackage extends WithDescription, ResolvedWithApiDefinition {
    type: "subpackage";
    apiSectionId: FdrAPI.ApiDefinitionId;
    id: APIV1Read.SubpackageId;
    name: string;
    title: string;
}

export function isResolvedSubpackage(item: ResolvedWithApiDefinition): item is ResolvedSubpackage {
    return (item as ResolvedSubpackage).type === "subpackage";
}

export interface ResolvedRootPackage extends ResolvedWithApiDefinition {
    type: "rootPackage";
    api: FdrAPI.ApiDefinitionId;
    auth: APIV1Read.ApiAuth | undefined;
    types: Record<string, ResolvedTypeDefinition>;
}

export type ResolvedApiDefinitionPackage = ResolvedRootPackage | ResolvedSubpackage;

export interface ResolvedEndpointDefinition extends WithDescription {
    id: APIV1Read.EndpointId;
    apiSectionId: FdrAPI.ApiDefinitionId;
    apiPackageId: FdrAPI.ApiDefinitionId | APIV1Read.SubpackageId;
    slug: string[];
    authed: boolean;
    availability: APIV1Read.Availability | undefined;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    name: string | undefined;
    title: string;
    path: ResolvedEndpointPathParts[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    headers: ResolvedObjectProperty[];
    requestBody: ResolvedRequestBody[];
    responseBody: ResolvedResponseBody | undefined;
    errors: ResolvedError[];
    examples: ResolvedExampleEndpointCall[];
}

export interface ResolvedExampleEndpointCall {
    name: string | undefined;
    description: string | undefined;
    path: string;
    pathParameters: Record<string, unknown>;
    queryParameters: Record<string, unknown>;
    headers: Record<string, unknown>;
    requestBody: ResolvedExampleEndpointRequest | undefined;
    responseStatusCode: number;
    responseBody: ResolvedExampleEndpointResponse | undefined;
    // responseHast: Root | undefined;
    snippets: ResolvedCodeSnippet[];
}

export type ResolvedExampleEndpointRequest = ResolvedExampleEndpointRequest.Json | ResolvedExampleEndpointRequest.Form;

export declare namespace ResolvedExampleEndpointRequest {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Form {
        type: "form";
        value: Record<string, ResolvedFormValue>;
    }
}

function resolveExampleEndpointRequest(
    requestBodyV3: APIV1Read.ExampleEndpointRequest | undefined,
    shape: ResolvedHttpRequestBodyShape | undefined,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
): ResolvedExampleEndpointRequest | undefined {
    if (requestBodyV3 == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(requestBodyV3, "type")._visit<ResolvedExampleEndpointRequest | undefined>({
        json: (json) => ({
            type: "json",
            value: json.value != null ? stripUndefines(sortKeysByShape(json.value, shape, resolvedTypes)) : undefined,
        }),
        form: (form) => ({
            type: "form",
            value: mapValues(form.value, (v) =>
                visitDiscriminatedUnion(v, "type")._visit<ResolvedFormValue>({
                    json: (value) => ({ type: "json", value: value.value }),
                    filename: (value) => ({ type: "filename", value: value.value }),
                    _other: () => ({ type: "json", value: undefined }), // TODO: handle other types
                }),
            ),
        }),
        _other: () => undefined,
    });
}

export type ResolvedFormValue = ResolvedFormValue.Json | ResolvedFormValue.Filename;

export declare namespace ResolvedFormValue {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Filename {
        type: "filename";
        value: string;
    }
}

export type ResolvedExampleEndpointResponse =
    | ResolvedExampleEndpointResponse.Json
    | ResolvedExampleEndpointResponse.Filename
    | ResolvedExampleEndpointResponse.Stream;

export declare namespace ResolvedExampleEndpointResponse {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Filename {
        type: "filename";
        value: string;
    }

    interface Stream {
        type: "stream";
        value: unknown[];
    }
}

function resolveExampleEndpointResponse(
    responseBodyV3: APIV1Read.ExampleEndpointResponse | undefined,
    shape: ResolvedHttpResponseBodyShape | undefined,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
): ResolvedExampleEndpointResponse | undefined {
    if (responseBodyV3 == null) {
        return undefined;
    }
    return visitDiscriminatedUnion(responseBodyV3, "type")._visit<ResolvedExampleEndpointResponse | undefined>({
        json: (json) => ({
            type: "json",
            value: json.value != null ? stripUndefines(sortKeysByShape(json.value, shape, resolvedTypes)) : undefined,
        }),
        filename: (filename) => ({ type: "filename", value: filename.value }),
        stream: (stream) => ({ type: "stream", value: stream.value }),
        _other: () => undefined,
    });
}

function stripUndefines(obj: unknown): unknown {
    return JSON.parse(JSON.stringify(obj));
}

export interface ResolvedCodeSnippet {
    name: string | undefined;
    language: string;
    install: string | undefined;
    code: string;
    // hast: Root;
    generated: boolean;
}

function resolveCodeSnippets(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | undefined,
    // highlighter: Highlighter,
): ResolvedCodeSnippet[] {
    let toRet: ResolvedCodeSnippet[] = [];

    const curlCode = stringifyHttpRequestExampleToCurl(
        endpointExampleToHttpRequestExample(auth, endpoint, example, requestBody),
    );

    toRet.push({
        name: undefined,
        language: "curl",
        install: undefined,
        code: curlCode,
        // hast: highlight(highlighter, curlCode, "bash"),
        generated: true,
    });

    if (example.codeExamples.pythonSdk != null) {
        const code = trimCode(example.codeExamples.pythonSdk.sync_client);
        toRet.push({
            name: undefined,
            language: "python",
            install: example.codeExamples.pythonSdk.install,
            code,
            // hast: highlight(highlighter, code, "python"),
            generated: true,
        });
    }

    if (example.codeExamples.typescriptSdk != null) {
        const code = trimCode(example.codeExamples.typescriptSdk.client);
        toRet.push({
            name: undefined,
            language: "typescript",
            install: example.codeExamples.typescriptSdk.install,
            code,
            // hast: highlight(highlighter, code, "typescript"),
            generated: true,
        });
    }

    if (example.codeExamples.goSdk != null) {
        const code = trimCode(example.codeExamples.goSdk.client);
        toRet.push({
            name: undefined,
            language: "go",
            install: example.codeExamples.goSdk.install,
            code,
            // hast: highlight(highlighter, code, "go"),
            generated: true,
        });
    }

    example.codeSamples.forEach((codeSample) => {
        const language = cleanLanguage(codeSample.language);
        // Remove any generated code snippets with the same language
        toRet = toRet.filter((snippet) => (snippet.generated ? snippet.language !== language : true));
        const code = trimCode(codeSample.code);
        toRet.push({
            name: codeSample.name,
            language,
            install: codeSample.install,
            code,
            // hast: highlight(highlighter, code, language),
            generated: false,
        });
    });

    return toRet;
}

function cleanLanguage(language: string): string {
    language = language.toLowerCase().trim();
    if (["node", "nodejs", "js", "javascript"].includes(language)) {
        return "javascript";
    }

    if (["py", "python"].includes(language)) {
        return "python";
    }

    if (["ts", "typescript", "ts-node"].includes(language)) {
        return "typescript";
    }

    if (["go", "golang"].includes(language)) {
        return "go";
    }

    return language;
}

export interface ResolvedRequestBody extends WithDescription {
    contentType: string;
    shape: ResolvedHttpRequestBodyShape;
}

export interface ResolvedError extends WithDescription, WithAvailability {
    shape: ResolvedTypeShape | undefined;
    statusCode: number;
    name: string | undefined;
}

export interface ResolvedObjectProperty extends WithDescription, WithAvailability {
    key: APIV1Read.PropertyKey;
    valueShape: ResolvedTypeShape;
}

export interface ResolvedResponseBody extends WithDescription {
    shape: ResolvedHttpResponseBodyShape;
}

export type ResolvedEndpointPathParts = ResolvedEndpointPathParts.Literal | ResolvedEndpointPathParts.PathParameter;
export declare namespace ResolvedEndpointPathParts {
    interface Literal {
        type: "literal";
        value: string;
    }

    interface PathParameter extends ResolvedObjectProperty {
        type: "pathParameter";
    }
}

export function stringifyResolvedEndpointPathParts(pathParts: ResolvedEndpointPathParts[]): string {
    return pathParts.map((part) => (part.type === "literal" ? part.value : `:${part.key}`)).join("");
}

export interface ResolvedWebSocketChannel {
    id: string;
    slug: string[];
    name: string | undefined;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
    authed: boolean;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    path: ResolvedEndpointPathParts[];
    headers: ResolvedObjectProperty[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    messages: ResolvedWebSocketMessage[];
    examples: APIV1Read.ExampleWebSocketSession[];
}

export interface ResolvedWebSocketMessage extends Omit<APIV1Read.WebSocketMessage, "body"> {
    body: ResolvedTypeShape;
}

export interface ResolvedWebhookDefinition extends WithDescription {
    id: APIV1Read.WebhookId;
    slug: string[];

    method: APIV1Read.WebhookHttpMethod;
    name: string | undefined;
    path: string[];
    headers: ResolvedObjectProperty[];
    payload: ResolvedPayload;
    examples: ResolvedExampleWebhookPayload[];
}
export interface ResolvedExampleWebhookPayload {
    payload: unknown;
    // hast: Root;
}

export interface ResolvedPayload extends WithDescription {
    shape: ResolvedTypeShape;
}

export interface ResolvedObjectShape extends WithDescription, WithAvailability {
    name: string | undefined;
    type: "object";
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedUndiscriminatedUnionShapeVariant extends WithDescription, WithAvailability {
    displayName: string | undefined;
    shape: ResolvedTypeShape;
}

export interface ResolvedUndiscriminatedUnionShape extends WithDescription, WithAvailability {
    name: string | undefined;
    type: "undiscriminatedUnion";
    variants: ResolvedUndiscriminatedUnionShapeVariant[];
}

export interface ResolvedDiscriminatedUnionShapeVariant extends WithDescription, WithAvailability {
    discriminantValue: string;
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedDiscriminatedUnionShape extends WithDescription, WithAvailability {
    name: string | undefined;
    type: "discriminatedUnion";
    discriminant: string;
    variants: ResolvedDiscriminatedUnionShapeVariant[];
}

export interface ResolvedOptionalShape {
    type: "optional";
    shape: NonOptionalTypeShape;
}

export interface ResolvedListShape {
    type: "list";
    shape: ResolvedTypeShape;
}

export interface ResolvedSetShape {
    type: "set";
    shape: ResolvedTypeShape;
}

export interface ResolvedMapShape {
    type: "map";
    keyShape: ResolvedTypeShape;
    valueShape: ResolvedTypeShape;
}

export type ResolvedTypeDefinition =
    | ResolvedObjectShape
    | ResolvedUndiscriminatedUnionShape
    | ResolvedDiscriminatedUnionShape
    | ResolvedEnumShape
    | ResolvedAliasShape
    | APIV1Read.TypeReference.Unknown;

interface ResolvedEnumShape extends WithDescription, WithAvailability {
    name: string | undefined;
    type: "enum";
    values: ResolvedEnumValue[];
}

export interface ResolvedEnumValue extends WithDescription {
    value: string;
}

interface ResolvedAliasShape extends WithDescription, WithAvailability {
    name: string | undefined;
    type: "alias";
    shape: ResolvedTypeShape;
}

export type ResolvedTypeShape =
    | ResolvedTypeDefinition
    | APIV1Read.PrimitiveType
    | ResolvedOptionalShape
    | ResolvedListShape
    | ResolvedSetShape
    | ResolvedMapShape
    | APIV1Read.LiteralType
    | APIV1Read.TypeReference.Unknown
    | ResolvedReferenceShape;

export type DereferencedTypeShape = Exclude<ResolvedTypeShape, ResolvedReferenceShape>;
export type NonOptionalTypeShape = Exclude<DereferencedTypeShape, ResolvedOptionalShape>;

export interface ResolvedReferenceShape {
    type: "reference";
    typeId: string;
}

export type ResolvedHttpRequestBodyShape = APIV1Read.HttpRequestBodyShape.FileUpload | ResolvedTypeShape;

interface ResolvedHttpRequestBodyShapeVisitor<T> {
    fileUpload: (shape: APIV1Read.HttpRequestBodyShape.FileUpload) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

export function visitResolvedHttpRequestBodyShape<T>(
    shape: ResolvedHttpRequestBodyShape,
    visitor: ResolvedHttpRequestBodyShapeVisitor<T>,
): T {
    if (shape.type === "fileUpload") {
        return visitor.fileUpload(shape);
    } else {
        return visitor.typeShape(shape);
    }
}

export type ResolvedHttpResponseBodyShape =
    | APIV1Read.HttpResponseBodyShape.FileDownload
    | APIV1Read.HttpResponseBodyShape.StreamingText
    | APIV1Read.HttpResponseBodyShape.StreamCondition
    | ResolvedTypeShape;

interface ResolvedHttpResponseBodyShapeVisitor<T> {
    fileDownload: (shape: APIV1Read.HttpResponseBodyShape.FileDownload) => T;
    streamingText: (shape: APIV1Read.HttpResponseBodyShape.StreamingText) => T;
    streamCondition: (shape: APIV1Read.HttpResponseBodyShape.StreamCondition) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

export function visitResolvedHttpResponseBodyShape<T>(
    shape: ResolvedHttpResponseBodyShape,
    visitor: ResolvedHttpResponseBodyShapeVisitor<T>,
): T {
    switch (shape.type) {
        case "fileDownload":
            return visitor.fileDownload(shape);
        case "streamingText":
            return visitor.streamingText(shape);
        case "streamCondition":
            return visitor.streamCondition(shape);
        default:
            return visitor.typeShape(shape);
    }
}

export function unwrapReference(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): DereferencedTypeShape {
    if (shape.type === "reference") {
        const nestedShape = types[shape.typeId];
        if (nestedShape == null) {
            return { type: "unknown" };
        }
        return unwrapReference(nestedShape, types);
    }
    return shape;
}

export function unwrapOptional(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): NonOptionalTypeShape {
    shape = unwrapReference(shape, types);
    if (shape.type === "optional") {
        return unwrapOptional(shape.shape, types);
    }
    return shape;
}

export function unwrapReferenceRaw(
    shape: ResolvedTypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): DereferencedTypeShape {
    if (shape.type === "reference") {
        const nestedShape = types[shape.typeId];
        if (nestedShape == null) {
            return { type: "unknown" };
        }
        return unwrapReferenceRaw(resolveTypeDefinition(nestedShape, types), types);
    }
    return shape;
}

export function unwrapOptionalRaw(
    shape: ResolvedTypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): NonOptionalTypeShape {
    shape = unwrapReferenceRaw(shape, types);
    if (shape.type === "optional") {
        return unwrapOptionalRaw(shape.shape, types);
    }
    return shape;
}

// HACK: remove this function when we have a proper way to merge content types
function mergeContentTypes(definitions: ResolvedEndpointDefinition[]): ResolvedEndpointDefinition[] {
    const toRet: ResolvedEndpointDefinition[] = [];

    definitions.forEach((definition) => {
        if (!definition.id.endsWith("_multipart")) {
            toRet.push(definition);
        }
    });

    definitions.forEach((definition) => {
        if (definition.id.endsWith("_multipart")) {
            const baseId = definition.id.replace("_multipart", "");
            const baseDefinition = toRet.find((def) => def.id === baseId);
            if (baseDefinition) {
                baseDefinition.requestBody = [...baseDefinition.requestBody, ...definition.requestBody];
            } else {
                toRet.push(definition);
            }
        }
    });

    return toRet;
}
