import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { WithoutQuestionMarks } from "@fern-api/fdr-sdk/dist/converters/utils/WithoutQuestionMarks";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { last, noop, sortBy } from "lodash-es";
import { titleCase } from "./titleCase";

export function resolveNavigationItems(
    navigationItems: DocsV1Read.NavigationItem[],
    apis: Record<FdrAPI.ApiId, APIV1Read.ApiDefinition>,
    parentSlugs: string[] = [],
): ResolvedNavigationItem[] {
    const resolvedNavigationItems: ResolvedNavigationItem[] = [];

    for (const navigationItem of navigationItems) {
        visitDiscriminatedUnion(navigationItem, "type")._visit({
            page: (page) => {
                const lastResolvedNavigationItem = last(resolvedNavigationItems);
                if (lastResolvedNavigationItem != null && lastResolvedNavigationItem.type === "pageGroup") {
                    lastResolvedNavigationItem.pages.push({
                        ...page,
                        slug: [...parentSlugs, page.urlSlug],
                    });
                } else {
                    resolvedNavigationItems.push({
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
                    resolvedNavigationItems.push({
                        ...api,
                        type: "apiSection",
                        auth: definition.auth,
                        hasMultipleBaseUrls: definition.hasMultipleBaseUrls,
                        slug: [...parentSlugs, api.urlSlug],
                        endpoints: mergeContentTypes(
                            definition.rootPackage.endpoints.map((endpoint) =>
                                resolveEndpointDefinition(
                                    definition.id,
                                    definition.id,
                                    endpoint,
                                    definition.types,
                                    definitionSlug,
                                ),
                            ),
                        ),
                        websockets: definition.rootPackage.websockets.map((websocket) =>
                            resolveWebsocketChannel(websocket, definition.types, definitionSlug),
                        ),
                        webhooks: definition.rootPackage.webhooks.map((webhook) =>
                            resolveWebhookDefinition(webhook, definition.types, definitionSlug),
                        ),
                        subpackages: definition.rootPackage.subpackages
                            .map((subpackageId) =>
                                resolveSubpackage(
                                    api.api,
                                    subpackageId,
                                    definition.subpackages,
                                    definition.types,
                                    api.skipUrlSlug ? parentSlugs : [...parentSlugs, api.urlSlug],
                                ),
                            )
                            .filter(isNonNullish),
                        pointsTo: definition.rootPackage.pointsTo,
                    });
                }
            },
            section: (section) => {
                const sectionSlug = [...parentSlugs, section.urlSlug];
                resolvedNavigationItems.push({
                    ...section,
                    slug: sectionSlug,
                    items: resolveNavigationItems(section.items, apis, section.skipUrlSlug ? parentSlugs : sectionSlug),
                });
            },
            link: noop,
            _other: noop,
        });
    }

    return resolvedNavigationItems;
}

function resolveSubpackage(
    apiSectionId: FdrAPI.ApiDefinitionId,
    subpackageId: APIV1Read.SubpackageId,
    subpackagesMap: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    types: Record<string, APIV1Read.TypeDefinition>,
    parentSlugs: string[],
): ResolvedSubpackage | undefined {
    const subpackage = subpackagesMap[subpackageId];
    if (subpackage == null) {
        return undefined;
    }
    const slug = [...parentSlugs, subpackage.urlSlug];
    const endpoints = mergeContentTypes(
        subpackage.endpoints.map((endpoint) =>
            resolveEndpointDefinition(apiSectionId, subpackageId, endpoint, types, slug),
        ),
    );
    const websockets = subpackage.websockets.map((websocket) => resolveWebsocketChannel(websocket, types, slug));
    const webhooks = subpackage.webhooks.map((webhook) => resolveWebhookDefinition(webhook, types, slug));
    const subpackages = subpackage.subpackages
        .map((subpackageId) => resolveSubpackage(apiSectionId, subpackageId, subpackagesMap, types, slug))
        .filter(isNonNullish);

    if (endpoints.length === 0 && webhooks.length === 0 && subpackages.length === 0 && websockets.length === 0) {
        return undefined;
    }
    return {
        ...subpackage,
        title: titleCase(subpackage.name),
        type: "subpackage",
        apiSectionId,
        id: subpackageId,
        slug,
        endpoints,
        websockets,
        webhooks,
        subpackages,
        pointsTo: subpackage.pointsTo,
    };
}

function resolveEndpointDefinition(
    apiSectionId: FdrAPI.ApiDefinitionId,
    apiPackageId: FdrAPI.ApiDefinitionId,
    endpoint: APIV1Read.EndpointDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    parentSlugs: string[],
): ResolvedEndpointDefinition {
    const pathParameters = endpoint.path.pathParameters.map(
        (parameter): ResolvedObjectProperty => ({
            ...parameter,
            valueShape: resolveTypeReference(parameter.type, types),
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
                };
            }
            return {
                ...parameter,
                type: "pathParameter",
            };
        }
    });
    return {
        slug: [...parentSlugs, endpoint.urlSlug],
        ...endpoint,
        apiSectionId,
        apiPackageId,
        title: endpoint.name != null ? endpoint.name : stringifyResolvedEndpointPathParts(path),
        defaultEnvironment: endpoint.environments.find((environment) => environment.id === endpoint.defaultEnvironment),
        path,
        pathParameters,
        queryParameters: endpoint.queryParameters.map((parameter) => ({
            ...parameter,
            valueShape: resolveTypeReference(parameter.type, types),
        })),
        headers: endpoint.headers.map((header) => ({
            ...header,
            valueShape: resolveTypeReference(header.type, types),
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
                      ...endpoint.response,
                      shape: resolveResponseBodyShape(endpoint.response.type, types),
                  }
                : undefined,
        errors: (endpoint.errorsV2 ?? []).map(
            (error): ResolvedError => ({
                ...error,
                name: error.name,
                shape: error.type != null ? resolveTypeShape(error.type, types) : undefined,
            }),
        ),
    };
}

function resolveWebsocketChannel(
    websocket: APIV1Read.WebSocketChannel,
    types: Record<string, APIV1Read.TypeDefinition>,
    parentSlugs: string[],
): ResolvedWebSocketChannel {
    const pathParameters = websocket.path.pathParameters.map(
        (parameter): ResolvedObjectProperty => ({
            ...parameter,
            valueShape: resolveTypeReference(parameter.type, types),
        }),
    );
    return {
        ...websocket,
        id: websocket.id,
        description: websocket.description,
        availability: websocket.availability,
        slug: [...parentSlugs, websocket.urlSlug],
        name: websocket.name != null ? websocket.name : websocket.urlSlug,
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
            ...header,
            valueShape: resolveTypeReference(header.type, types),
        })),
        pathParameters,
        queryParameters: websocket.queryParameters.map(
            (parameter): ResolvedObjectProperty => ({
                ...parameter,
                valueShape: resolveTypeReference(parameter.type, types),
            }),
        ),
        messages: websocket.messages.map(({ body, ...message }) => ({
            ...message,
            body: resolvePayloadShape(body, types),
        })),
        examples: websocket.examples,
        defaultEnvironment: websocket.environments.find((env) => env.id === websocket.defaultEnvironment),
    };
}

function resolveWebhookDefinition(
    webhook: APIV1Read.WebhookDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    parentSlugs: string[],
): ResolvedWebhookDefinition {
    return {
        name: webhook.name != null ? webhook.name : webhook.urlSlug,
        slug: [...parentSlugs, webhook.urlSlug],
        ...webhook,
        headers: webhook.headers.map((header) => ({
            ...header,
            valueShape: resolveTypeReference(header.type, types),
        })),
        payload: {
            ...webhook.payload,
            shape: resolvePayloadShape(webhook.payload.type, types),
        },
    };
}

function resolvePayloadShape(
    payloadShape: APIV1Read.WebhookPayloadShape | APIV1Read.WebSocketMessageBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedTypeReference {
    return visitDiscriminatedUnion(payloadShape, "type")._visit<ResolvedTypeReference>({
        object: (object) => ({
            type: "object",
            properties: () => resolveObjectProperties(object, types),
        }),
        reference: (reference) => ({
            type: "reference",
            shape: () => unwrapReference(resolveTypeReference(reference.value, types)),
        }),
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
            properties: () => resolveObjectProperties(object, types),
        }),
        fileUpload: (fileUpload) => fileUpload,
        reference: (reference) => ({
            type: "reference",
            shape: () => unwrapReference(resolveTypeReference(reference.value, types)),
        }),
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
            properties: () => resolveObjectProperties(object, types),
        }),
        fileDownload: (fileDownload) => fileDownload,
        streamingText: (streamingText) => streamingText,
        streamCondition: (streamCondition) => streamCondition,
        reference: (reference) => ({
            type: "reference",
            shape: () => unwrapReference(resolveTypeReference(reference.value, types)),
        }),
        stream: () => ({ type: "unknown" }), //TODO IMPLEMENT
        _other: () => ({ type: "unknown" }),
    });
}

function resolveTypeShape(
    typeShape: APIV1Read.TypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedTypeReference {
    return visitDiscriminatedUnion(typeShape, "type")._visit<ResolvedTypeReference>({
        object: (object) => ({
            type: "object",
            properties: () => resolveObjectProperties(object, types),
        }),
        enum: (enum_) => enum_,
        undiscriminatedUnion: (undiscriminatedUnion) => ({
            type: "undiscriminatedUnion",
            variants: undiscriminatedUnion.variants.map(({ type, ...variant }) => ({
                ...variant,
                displayName: variant.displayName,
                shape: resolveTypeReference(type, types),
            })),
        }),
        alias: (alias) => resolveTypeReference(alias.value, types),
        discriminatedUnion: (discriminatedUnion) => ({
            type: "discriminatedUnion",
            discriminant: discriminatedUnion.discriminant,
            variants: discriminatedUnion.variants.map((variant) => ({
                ...variant,
                additionalProperties: resolveObjectProperties(variant.additionalProperties, types),
            })),
        }),
        _other: () => ({ type: "unknown" }),
    });
}

function resolveTypeReference(
    typeReference: APIV1Read.TypeReference,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedTypeReference {
    return visitDiscriminatedUnion(typeReference, "type")._visit<ResolvedTypeReference>({
        literal: (literal) => literal.value,
        unknown: (unknown) => unknown,
        optional: (optional) => ({
            type: "optional",
            shape: unwrapOptional(resolveTypeReference(optional.itemType, types)),
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
            return { type: "reference", shape: () => unwrapReference(resolveTypeShape(typeDefinition.shape, types)) };
        },
        primitive: (primitive) => primitive.value,
        _other: () => ({ type: "unknown" }),
    });
}

function resolveObjectProperties(
    object: APIV1Read.ObjectType,
    types: Record<string, APIV1Read.TypeDefinition>,
): ResolvedObjectProperty[] {
    const directProperties = object.properties.map((property) => ({
        ...property,
        valueShape: resolveTypeReference(property.valueType, types),
    }));
    const extendedProperties = object.extends.flatMap((typeId) => {
        const shape = unwrapReference(resolveTypeReference({ type: "id", value: typeId }, types));
        // TODO: should we be able to extend discriminated and undiscriminated unions?
        if (shape?.type !== "object") {
            // eslint-disable-next-line no-console
            console.error("Object extends non-object", typeId);
            return [];
        }
        return shape.properties();
    });
    if (extendedProperties.length === 0) {
        // if there are no extended properties, we can just return the direct properties
        // required properties should come before optional properties
        // however, we do NOT sort the properties by key because the initial order of properties may be significant
        return sortBy([...directProperties], (property) => unwrapReference(property.valueShape).type === "optional");
    }
    const propertyKeys = new Set(object.properties.map((property) => property.key));
    const filteredExtendedProperties = extendedProperties.filter(
        (extendedProperty) => !propertyKeys.has(extendedProperty.key),
    );

    // required properties should come before optional properties
    // since there are extended properties, the initial order of properties are not significant, and we should sort by key
    return sortBy(
        [...directProperties, ...filteredExtendedProperties],
        (property) => unwrapReference(property.valueShape).type === "optional",
        (property) => property.key,
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
    extends Omit<DocsV1Read.ApiSection, "urlSlug">,
        ResolvedWithApiDefinition {
    type: "apiSection";
    auth: APIV1Read.ApiAuth | undefined;
    hasMultipleBaseUrls: boolean | undefined;
    slug: string[];
}

export interface FlattenedApiSection {
    apiSection: ResolvedNavigationItemApiSection;
    apiDefinitions: ResolvedApiDefinition[];
}

export function flattenApiSection(apiSection: ResolvedNavigationItemApiSection): FlattenedApiSection {
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
        apiSection,
        apiDefinitions: getApiDefinitions(apiSection),
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
    pointsTo: APIV1Read.SubpackageId | undefined;
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

export interface ResolvedSubpackage extends APIV1Read.WithDescription, ResolvedWithApiDefinition {
    type: "subpackage";
    apiSectionId: FdrAPI.ApiDefinitionId;
    id: APIV1Read.SubpackageId;
    name: string;
    title: string;
    slug: string[];
}

export type ResolvedApiDefinitionPackage = ResolvedNavigationItemApiSection | ResolvedSubpackage;

export interface ResolvedEndpointDefinition extends APIV1Read.WithDescription {
    id: APIV1Read.EndpointId;
    apiSectionId: FdrAPI.ApiDefinitionId;
    apiPackageId: FdrAPI.ApiDefinitionId | APIV1Read.SubpackageId;
    slug: string[];
    authed: boolean;
    availability?: APIV1Read.Availability;
    defaultEnvironment?: APIV1Read.Environment;
    environments: APIV1Read.Environment[];
    method: APIV1Read.HttpMethod;
    name?: string;
    title: string;
    path: ResolvedEndpointPathParts[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    headers: ResolvedObjectProperty[];
    requestBody: ResolvedRequestBody[];
    responseBody: ResolvedResponseBody | undefined;
    errors: ResolvedError[];
    examples: APIV1Read.ExampleEndpointCall[];
}

export interface ResolvedRequestBody extends APIV1Read.WithDescription {
    contentType: string;
    shape: ResolvedHttpRequestBodyShape;
}

export interface ResolvedError extends APIV1Read.WithDescription, APIV1Read.WithAvailability {
    shape: ResolvedTypeReference | undefined;
    statusCode: number;
    name: string | undefined;
}

export interface ResolvedObjectProperty extends APIV1Read.WithDescription, APIV1Read.WithAvailability {
    key: APIV1Read.PropertyKey;
    valueShape: ResolvedTypeReference;
}

export interface ResolvedResponseBody extends APIV1Read.WithDescription {
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

export interface ResolvedWebSocketChannel
    extends WithoutQuestionMarks<
        Omit<
            APIV1Read.WebSocketChannel,
            | "urlSlug"
            | "path"
            | "headers"
            | "queryParameters"
            | "messages"
            | "defaultEnvironment"
            | "htmlDescription"
            | "descriptionContainsMarkdown"
        >
    > {
    slug: string[];
    path: ResolvedEndpointPathParts[];
    headers: ResolvedObjectProperty[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    messages: ResolvedWebSocketMessage[];
    defaultEnvironment: APIV1Read.Environment | undefined;
}

export interface ResolvedWebSocketMessage extends Omit<APIV1Read.WebSocketMessage, "body"> {
    body: ResolvedTypeReference;
}

export interface ResolvedWebhookDefinition extends APIV1Read.WithDescription {
    id: APIV1Read.WebhookId;
    slug: string[];

    method: APIV1Read.WebhookHttpMethod;
    name: string | undefined;
    path: string[];
    headers: ResolvedObjectProperty[];
    payload: ResolvedPayload;
    examples: APIV1Read.ExampleWebhookPayload[];
}

export interface ResolvedPayload extends APIV1Read.WithDescription {
    shape: ResolvedTypeReference;
}

export interface ResolvedObjectShape {
    type: "object";
    properties: () => ResolvedObjectProperty[];
}

export interface ResolvedUndiscriminatedUnionShapeVariant
    extends APIV1Read.WithDescription,
        APIV1Read.WithAvailability {
    displayName: string | undefined;
    shape: ResolvedTypeReference;
}

export interface ResolvedUndiscriminatedUnionShape {
    type: "undiscriminatedUnion";
    variants: ResolvedUndiscriminatedUnionShapeVariant[];
}

export interface ResolvedDiscriminatedUnionShapeVariant extends APIV1Read.WithDescription, APIV1Read.WithAvailability {
    discriminantValue: string;
    additionalProperties: ResolvedObjectProperty[];
}

export interface ResolvedDiscriminatedUnionShape {
    type: "discriminatedUnion";
    discriminant: string;
    variants: ResolvedDiscriminatedUnionShapeVariant[];
}

export interface ResolvedOptionalShape {
    type: "optional";
    shape: Exclude<ResolvedTypeReference, ResolvedOptionalShape>;
}

export interface ResolvedListShape {
    type: "list";
    shape: ResolvedTypeReference;
}

export interface ResolvedSetShape {
    type: "set";
    shape: ResolvedTypeReference;
}

export interface ResolvedMapShape {
    type: "map";
    keyShape: ResolvedTypeReference;
    valueShape: ResolvedTypeReference;
}

export type ResolvedTypeShape =
    | ResolvedObjectShape
    | ResolvedUndiscriminatedUnionShape
    | ResolvedDiscriminatedUnionShape
    | APIV1Read.TypeShape.Enum;

export type ResolvedTypeReference =
    | ResolvedTypeShape
    | APIV1Read.PrimitiveType
    | ResolvedOptionalShape
    | ResolvedListShape
    | ResolvedSetShape
    | ResolvedMapShape
    | APIV1Read.LiteralType
    | APIV1Read.TypeReference.Unknown
    | ResolvedReferenceShape;

export interface ResolvedReferenceShape {
    type: "reference";
    shape: () => Exclude<ResolvedTypeReference, ResolvedReferenceShape>;
}

export type ResolvedHttpRequestBodyShape = APIV1Read.HttpRequestBodyShape.FileUpload | ResolvedTypeReference;

interface ResolvedHttpRequestBodyShapeVisitor<T> {
    fileUpload: (shape: APIV1Read.HttpRequestBodyShape.FileUpload) => T;
    typeReference: (shape: ResolvedTypeReference) => T;
}

export function visitResolvedHttpRequestBodyShape<T>(
    shape: ResolvedHttpRequestBodyShape,
    visitor: ResolvedHttpRequestBodyShapeVisitor<T>,
): T {
    if (shape.type === "fileUpload") {
        return visitor.fileUpload(shape);
    } else {
        return visitor.typeReference(shape);
    }
}

export type ResolvedHttpResponseBodyShape =
    | APIV1Read.HttpResponseBodyShape.FileDownload
    | APIV1Read.HttpResponseBodyShape.StreamingText
    | APIV1Read.HttpResponseBodyShape.StreamCondition
    | ResolvedTypeReference;

interface ResolvedHttpResponseBodyShapeVisitor<T> {
    fileDownload: (shape: APIV1Read.HttpResponseBodyShape.FileDownload) => T;
    streamingText: (shape: APIV1Read.HttpResponseBodyShape.StreamingText) => T;
    streamCondition: (shape: APIV1Read.HttpResponseBodyShape.StreamCondition) => T;
    typeReference: (shape: ResolvedTypeReference) => T;
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
            return visitor.typeReference(shape);
    }
}

export function unwrapReference(shape: ResolvedTypeReference): Exclude<ResolvedTypeReference, ResolvedReferenceShape> {
    if (shape.type === "reference") {
        return unwrapReference(shape.shape());
    }
    return shape;
}

export function unwrapOptional(
    shape: ResolvedTypeReference,
): Exclude<ResolvedTypeReference, ResolvedOptionalShape | ResolvedReferenceShape> {
    shape = unwrapReference(shape);
    if (shape.type === "optional") {
        return unwrapOptional(shape.shape);
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
