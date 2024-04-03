import type { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import {
    FlattenedApiDefinition,
    FlattenedApiDefinitionPackage,
    FlattenedApiDefinitionPackageItem,
    FlattenedEndpointDefinition,
    FlattenedSubpackage,
    FlattenedWebSocketChannel,
    FlattenedWebhookDefinition,
} from "@fern-ui/fdr-utils";
import { mapValues, pick, sortBy } from "lodash-es";
import type { MDXRemoteSerializeResult } from "next-mdx-remote";
import { emitDatadogError } from "../analytics/datadogRum";
import { convertEndpointExampleToHttpRequestExample } from "../api-page/examples/HttpRequestExample";
import { sortKeysByShape } from "../api-page/examples/sortKeysByShape";
import { stringifyHttpRequestExampleToCurl } from "../api-page/examples/stringifyHttpRequestExampleToCurl";
import { maybeSerializeMdxContent } from "../mdx/mdx";

type WithoutQuestionMarks<T> = {
    [K in keyof Required<T>]: undefined extends T[K] ? T[K] | undefined : T[K];
};

export type WithDescription = { description: MDXRemoteSerializeResult | string | undefined };
export type WithAvailability = { availability: APIV1Read.Availability | undefined };

export interface WithMetadata {
    description: MDXRemoteSerializeResult | string | undefined;
    availability: APIV1Read.Availability | undefined;
}

export async function resolveApiDefinition(
    apiDefinition: FlattenedApiDefinition,
    filteredTypes?: string[],
): Promise<ResolvedRootPackage> {
    // const highlighter = await getHighlighterInstance();

    const resolvedTypes = Object.fromEntries(
        await Promise.all(
            Object.entries(filteredTypes != null ? pick(apiDefinition.types, filteredTypes) : apiDefinition.types).map(
                async ([key, value]) => [key, await resolveTypeDefinition(value, apiDefinition.types)],
            ),
        ),
    );

    const withPackage = await resolveApiDefinitionPackage(
        apiDefinition,
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

async function resolveApiDefinitionPackage(
    apiDefinition: FlattenedApiDefinition,
    id: APIV1Read.SubpackageId,
    package_: FlattenedApiDefinitionPackage | undefined,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
): Promise<ResolvedWithApiDefinition> {
    if (package_ == null) {
        return { items: [], slug: [] };
    }

    const maybeItems = await Promise.all(
        package_.items.map((item) =>
            FlattenedApiDefinitionPackageItem.visit<Promise<ResolvedPackageItem | undefined>>(item, {
                endpoint: (endpoint) => resolveEndpointDefinition(apiDefinition, id, endpoint, types, resolvedTypes),
                websocket: (websocket) => resolveWebsocketChannel(apiDefinition, websocket, types),
                webhook: (webhook) => resolveWebhookDefinition(webhook, types, resolvedTypes),
                subpackage: (subpackage) => resolveSubpackage(apiDefinition, subpackage, types, resolvedTypes),
            }),
        ),
    );

    const items = maybeItems.filter(isNonNullish);

    return {
        items,
        slug: package_.slug,
    };
}

async function resolveSubpackage(
    apiDefinition: FlattenedApiDefinition,
    subpackage: FlattenedSubpackage,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
): Promise<ResolvedSubpackage | undefined> {
    const { items } = await resolveApiDefinitionPackage(
        apiDefinition,
        subpackage.subpackageId,
        subpackage,
        types,
        resolvedTypes,
    );

    if (subpackage == null || items.length === 0) {
        return undefined;
    }
    return {
        name: subpackage.name,
        description: await maybeSerializeMdxContent(subpackage.description),
        availability: undefined,
        title: subpackage.name, // titleCase() is already applied for FlattenedApiDefinition
        type: "subpackage",
        apiSectionId: apiDefinition.api,
        id: subpackage.subpackageId,
        slug: subpackage.slug,
        items,
    };
}

async function resolveEndpointDefinition(
    apiDefinition: FlattenedApiDefinition,
    apiPackageId: FdrAPI.ApiDefinitionId,
    endpoint: FlattenedEndpointDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): Promise<ResolvedEndpointDefinition> {
    const pathParametersPromise = await Promise.all(
        endpoint.path.pathParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(parameter.type, types),
                maybeSerializeMdxContent(parameter.description),
            ]);
            return {
                key: parameter.key,
                valueShape,
                description,
                availability: parameter.availability,
                hidden: false,
            };
        }),
    );

    const queryParametersPromise = Promise.all(
        endpoint.queryParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(parameter.type, types),
                maybeSerializeMdxContent(parameter.description),
            ]);
            return {
                key: parameter.key,
                valueShape,
                description,
                availability: parameter.availability,
                hidden: false,
            };
        }),
    );

    const headersPromise = Promise.all([
        ...endpoint.headers.map(async (header): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(header.type, types),
                maybeSerializeMdxContent(header.description),
            ]);
            return {
                key: header.key,
                valueShape,
                description,
                availability: header.availability,
                hidden: false,
            };
        }),
        ...apiDefinition.globalHeaders.map(async (header): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(header.type, types),
                maybeSerializeMdxContent(header.description),
            ]);
            return {
                key: header.key,
                valueShape,
                description,
                availability: header.availability,
                hidden: true,
            };
        }),
    ]);

    const errorsPromise = Promise.all(
        endpoint.errors.map(async (error): Promise<ResolvedError> => {
            const [shape, description] = await Promise.all([
                error.type != null
                    ? resolveTypeShape(undefined, error.type, types, undefined, undefined)
                    : ({ type: "unknown" } as ResolvedTypeDefinition),
                maybeSerializeMdxContent(error.description),
            ]);
            return {
                statusCode: error.statusCode,
                name: error.name,
                shape,
                description,
                availability: error.availability,
            };
        }),
    );

    const descriptionPromise = maybeSerializeMdxContent(endpoint.description);

    async function resolveRequestBody(request: APIV1Read.HttpRequest): Promise<ResolvedRequestBody> {
        const [shape, description] = await Promise.all([
            resolveRequestBodyShape(request.type, types),
            maybeSerializeMdxContent(request.description),
        ]);
        return {
            contentType: request.contentType,
            shape,
            description,
            availability: undefined,
        };
    }

    async function resolveResponseBody(response: APIV1Read.HttpResponse): Promise<ResolvedResponseBody> {
        const [shape, description] = await Promise.all([
            resolveResponseBodyShape(response.type, types),
            maybeSerializeMdxContent(response.description),
        ]);
        return { shape, description, availability: undefined };
    }

    const [pathParameters, queryParameters, rawHeaders, errors, description, requestBody, responseBody] =
        await Promise.all([
            pathParametersPromise,
            queryParametersPromise,
            headersPromise,
            errorsPromise,
            descriptionPromise,
            endpoint.request != null ? [await resolveRequestBody(endpoint.request)] : [],
            endpoint.response != null ? await resolveResponseBody(endpoint.response) : undefined,
        ]);

    const path = endpoint.path.parts.map((pathPart): ResolvedEndpointPathParts => {
        if (pathPart.type === "literal") {
            return pathPart;
        } else {
            const parameter = pathParameters.find((parameter) => parameter.key === pathPart.value);
            if (parameter == null) {
                return {
                    type: "pathParameter",
                    key: pathPart.value,
                    valueShape: {
                        type: "unknown",
                        availability: undefined,
                        description: undefined,
                    },
                    description: undefined,
                    availability: undefined,
                    hidden: false,
                };
            }
            return {
                ...parameter,
                type: "pathParameter",
            };
        }
    });

    const { auth, headers } = mergeAuthAndHeaders(endpoint.authed, apiDefinition.auth, rawHeaders);

    const toRet: ResolvedEndpointDefinition = {
        type: "endpoint",
        name: endpoint.name,
        id: endpoint.id,
        slug: endpoint.slug,
        description,
        auth,
        availability: endpoint.availability,
        apiSectionId: apiDefinition.api,
        apiPackageId,
        environments: endpoint.environments,
        method: endpoint.method,
        examples: [],
        title: endpoint.name != null ? endpoint.name : stringifyResolvedEndpointPathParts(path),
        defaultEnvironment: endpoint.defaultEnvironment,
        path,
        pathParameters,
        queryParameters,
        headers,
        requestBody,
        responseBody,
        errors,
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
            snippets: resolveCodeSnippets(toRet, example, requestBody),
        };
    });

    return toRet;
}

interface MergedAuthAndHeaders {
    auth: APIV1Read.ApiAuth | undefined;
    headers: ResolvedObjectProperty[];
}

// HACKHACK: this handles the case where FernIR is unable to interpret the security scheme for AsyncAPI
// and that we direct users to specify the websocket bindings instead.
function mergeAuthAndHeaders(
    authed: boolean,
    auth: APIV1Read.ApiAuth | undefined,
    headers: ResolvedObjectProperty[],
): MergedAuthAndHeaders {
    if (authed && auth != null) {
        return { auth, headers };
    }

    const filteredHeaders: ResolvedObjectProperty[] = [];

    for (const header of headers) {
        if (
            header.key.toLowerCase() === "authorization" ||
            header.key.toLowerCase().includes("api-key") ||
            header.key.toLowerCase().includes("apikey")
        ) {
            auth = {
                type: "header",
                headerWireValue: header.key,
            };
            continue;
        }
        filteredHeaders.push(header);
    }

    return { auth, headers: filteredHeaders };
}

async function resolveWebsocketChannel(
    apiDefinition: FlattenedApiDefinition,
    websocket: FlattenedWebSocketChannel,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedWebSocketChannel> {
    const pathParametersPromise = Promise.all(
        websocket.path.pathParameters.map(
            async (parameter): Promise<ResolvedObjectProperty> => ({
                key: parameter.key,
                valueShape: await resolveTypeReference(parameter.type, types),
                description: await maybeSerializeMdxContent(parameter.description),
                availability: parameter.availability,
                hidden: false,
            }),
        ),
    );
    const headersPromise = Promise.all([
        ...websocket.headers.map(async (header): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(header.type, types),
                maybeSerializeMdxContent(header.description),
            ]);
            return {
                key: header.key,
                valueShape,
                description,
                availability: header.availability,
                hidden: false,
            };
        }),
        ...apiDefinition.globalHeaders.map(async (header): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(header.type, types),
                maybeSerializeMdxContent(header.description),
            ]);
            return {
                key: header.key,
                valueShape,
                description,
                availability: header.availability,
                hidden: true,
            };
        }),
    ]);
    const queryParametersPromise = Promise.all(
        websocket.queryParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(parameter.type, types),
                maybeSerializeMdxContent(parameter.description),
            ]);
            return {
                key: parameter.key,
                valueShape,
                description,
                availability: parameter.availability,
                hidden: false,
            };
        }),
    );
    const messagesPromise = Promise.all(
        websocket.messages.map(async ({ type, body, origin, displayName, description, availability }) => {
            const [resolvedBody, resolvedDescription] = await Promise.all([
                resolvePayloadShape(body, types),
                maybeSerializeMdxContent(description),
            ]);
            return {
                type,
                body: resolvedBody,
                displayName,
                origin,
                description: resolvedDescription,
                availability,
            };
        }),
    );
    const [pathParameters, rawHeaders, queryParameters, messages] = await Promise.all([
        pathParametersPromise,
        headersPromise,
        queryParametersPromise,
        messagesPromise,
    ]);

    const { auth, headers } = mergeAuthAndHeaders(websocket.authed, apiDefinition.auth, rawHeaders);

    return {
        type: "websocket",
        auth,
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
        headers,
        pathParameters,
        queryParameters,
        messages,
        examples: websocket.examples,
        defaultEnvironment: websocket.defaultEnvironment,
    };
}

async function resolveWebhookDefinition(
    webhook: FlattenedWebhookDefinition,
    types: Record<string, APIV1Read.TypeDefinition>,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
    // highlighter: Highlighter,
): Promise<ResolvedWebhookDefinition> {
    const [payloadShape, description, headers] = await Promise.all([
        resolvePayloadShape(webhook.payload.type, types),
        await maybeSerializeMdxContent(webhook.description),
        Promise.all(
            webhook.headers.map(
                async (header): Promise<ResolvedObjectProperty> => ({
                    key: header.key,
                    valueShape: await resolveTypeReference(header.type, types),
                    description: await maybeSerializeMdxContent(header.description),
                    availability: header.availability,
                    hidden: false,
                }),
            ),
        ),
    ]);
    return {
        type: "webhook",
        name: webhook.name,
        description,
        availability: undefined,
        slug: webhook.slug,
        method: webhook.method,
        id: webhook.id,
        path: webhook.path,
        headers,
        payload: {
            shape: payloadShape,
            description: await maybeSerializeMdxContent(webhook.payload.description),
            availability: undefined,
        },
        examples: webhook.examples.map((example) => {
            const sortedPayload = safeSortKeysByShape(example.payload, payloadShape, resolvedTypes);
            return { payload: sortedPayload };
        }),
    };
}

function resolvePayloadShape(
    payloadShape: APIV1Read.WebhookPayloadShape | APIV1Read.WebSocketMessageBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedTypeShape> {
    return visitDiscriminatedUnion(payloadShape, "type")._visit<Promise<ResolvedTypeShape>>({
        object: async (object) => ({
            type: "object",
            name: undefined,
            extends: object.extends,
            properties: await resolveObjectProperties(object, types),
            description: undefined,
            availability: undefined,
        }),
        reference: (reference) => resolveTypeReference(reference.value, types),
        _other: () =>
            Promise.resolve({
                type: "unknown",
                availability: undefined,
                description: undefined,
            }),
    });
}

function resolveRequestBodyShape(
    requestBodyShape: APIV1Read.HttpRequestBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedHttpRequestBodyShape> {
    return visitDiscriminatedUnion(requestBodyShape, "type")._visit<Promise<ResolvedHttpRequestBodyShape>>({
        object: async (object) => ({
            type: "object",
            name: undefined,
            extends: object.extends,
            properties: await resolveObjectProperties(object, types),
            description: undefined,
            availability: undefined,
        }),
        fileUpload: async (fileUpload) => ({
            type: "fileUpload",
            value:
                fileUpload.value != null
                    ? {
                          description: await maybeSerializeMdxContent(fileUpload.value.description),
                          availability: fileUpload.value.availability,
                          name: fileUpload.value.name,
                          properties: await Promise.all(
                              fileUpload.value.properties.map(
                                  async (property): Promise<ResolvedFileUploadRequestProperty> => {
                                      switch (property.type) {
                                          case "file": {
                                              return {
                                                  type: property.value.type,
                                                  key: property.value.key,
                                                  // TODO: support description and availability
                                                  description: undefined,
                                                  availability: undefined,
                                                  isOptional: property.value.isOptional,
                                              };
                                          }
                                          case "bodyProperty": {
                                              const [description, valueShape] = await Promise.all([
                                                  maybeSerializeMdxContent(property.description),
                                                  resolveTypeReference(property.valueType, types),
                                              ]);
                                              return {
                                                  type: "bodyProperty",
                                                  key: property.key,
                                                  description,
                                                  availability: property.availability,
                                                  valueShape,
                                                  hidden: false,
                                              };
                                          }
                                      }
                                  },
                              ),
                          ),
                      }
                    : undefined,
        }),
        bytes: (bytes) => Promise.resolve(bytes),
        reference: (reference) => resolveTypeReference(reference.value, types),
        _other: () =>
            Promise.resolve({
                type: "unknown",
                availability: undefined,
                description: undefined,
            }),
    });
}

function resolveResponseBodyShape(
    responseBodyShape: APIV1Read.HttpResponseBodyShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedHttpResponseBodyShape> {
    return Promise.resolve(
        visitDiscriminatedUnion(responseBodyShape, "type")._visit<
            ResolvedHttpResponseBodyShape | Promise<ResolvedHttpResponseBodyShape>
        >({
            object: async (object) => ({
                type: "object",
                name: undefined,
                extends: object.extends,
                properties: await resolveObjectProperties(object, types),
                description: undefined,
                availability: undefined,
            }),
            fileDownload: (fileDownload) => fileDownload,
            streamingText: (streamingText) => streamingText,
            streamCondition: (streamCondition) => streamCondition,
            reference: (reference) => resolveTypeReference(reference.value, types),
            stream: async (stream) => {
                if (stream.shape.type === "reference") {
                    return {
                        type: "stream",
                        value: await resolveTypeReference(stream.shape.value, types),
                    };
                }
                return {
                    type: "stream",
                    value: {
                        type: "object",
                        name: undefined,
                        extends: stream.shape.extends,
                        properties: await resolveObjectProperties(stream.shape, types),
                        description: undefined,
                        availability: undefined,
                    },
                };
            },
            _other: () => ({ type: "unknown", availability: undefined, description: undefined }),
        }),
    );
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
): Promise<ResolvedTypeDefinition> {
    return visitDiscriminatedUnion(typeShape, "type")._visit<Promise<ResolvedTypeDefinition>>({
        object: async (object) => ({
            type: "object",
            name,
            extends: object.extends,
            properties: await resolveObjectProperties(object, types),
            description: await maybeSerializeMdxContent(description),
            availability,
        }),
        enum: async (enum_) => ({
            type: "enum",
            name,
            values: await Promise.all(
                enum_.values.map(async (enumValue) => ({
                    value: enumValue.value,
                    description: await maybeSerializeMdxContent(enumValue.description),
                    availability: undefined,
                })),
            ),
            description: await maybeSerializeMdxContent(description),
            availability,
        }),
        undiscriminatedUnion: async (undiscriminatedUnion) => ({
            type: "undiscriminatedUnion",
            name,
            variants: await Promise.all(
                undiscriminatedUnion.variants.map(async (variant) => ({
                    displayName: variant.displayName,
                    shape: await resolveTypeReference(variant.type, types),
                    description: await maybeSerializeMdxContent(variant.description),
                    availability: variant.availability,
                })),
            ),
            description: await maybeSerializeMdxContent(description),
            availability,
        }),
        alias: async (alias) => ({
            type: "alias",
            name,
            shape: await resolveTypeReference(alias.value, types),
            description: await maybeSerializeMdxContent(description),
            availability,
        }),
        discriminatedUnion: async (discriminatedUnion) => {
            return {
                type: "discriminatedUnion",
                name,
                discriminant: discriminatedUnion.discriminant,
                variants: await Promise.all(
                    discriminatedUnion.variants.map(async (variant) => ({
                        discriminantValue: variant.discriminantValue,
                        extends: variant.additionalProperties.extends,
                        properties: await resolveObjectProperties(variant.additionalProperties, types),
                        description: await maybeSerializeMdxContent(variant.description),
                        availability: variant.availability,
                    })),
                ),
                description: await maybeSerializeMdxContent(description),
                availability,
            };
        },
        _other: () =>
            Promise.resolve({
                type: "unknown",
                availability: undefined,
                description: undefined,
            }),
    });
}

function resolveTypeReference(
    typeReference: APIV1Read.TypeReference,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedTypeShape> {
    return Promise.resolve(
        visitDiscriminatedUnion(typeReference, "type")._visit<ResolvedTypeShape | Promise<ResolvedTypeShape>>({
            literal: (literal) => ({
                ...literal.value,
                description: undefined,
                availability: undefined,
            }),
            unknown: (unknown) => ({
                ...unknown,
                availability: undefined,
                description: undefined,
            }),
            optional: async (optional) => ({
                type: "optional",
                shape: await unwrapOptionalRaw(await resolveTypeReference(optional.itemType, types), types),
                availability: undefined,
                defaultsTo: undefined,
                description: undefined,
            }),
            list: async (list) => ({
                type: "list",
                shape: await resolveTypeReference(list.itemType, types),
                availability: undefined,
                description: undefined,
            }),
            set: async (set) => ({
                type: "set",
                shape: await resolveTypeReference(set.itemType, types),
                availability: undefined,
                description: undefined,
            }),
            map: async (map) => ({
                type: "map",
                keyShape: await resolveTypeReference(map.keyType, types),
                valueShape: await resolveTypeReference(map.valueType, types),
                availability: undefined,
                description: undefined,
            }),
            id: ({ value: typeId }) => {
                const typeDefinition = types[typeId];
                if (typeDefinition == null) {
                    return { type: "unknown", availability: undefined, description: undefined };
                }
                return {
                    type: "reference",
                    typeId,
                    availability: undefined,
                    description: undefined,
                };
            },
            primitive: (primitive) => ({
                type: primitive.value.type,
                description: undefined,
                availability: undefined,
            }),
            _other: () => ({ type: "unknown", availability: undefined, description: undefined }),
        }),
    );
}

export function dereferenceObjectProperties(
    object: ResolvedObjectShape | ResolvedDiscriminatedUnionShapeVariant,
    types: Record<string, ResolvedTypeDefinition>,
): ResolvedObjectProperty[] {
    const directProperties = object.properties;
    const extendedProperties = object.extends.flatMap((typeId) => {
        const referencedShape = types[typeId] ?? {
            type: "unknown",
            availability: undefined,
            description: undefined,
        };
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
            (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
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
        (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
        (property) => property.key,
    );
}

function resolveObjectProperties(
    object: APIV1Read.ObjectType,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<ResolvedObjectProperty[]> {
    return Promise.all(
        object.properties.map(async (property): Promise<ResolvedObjectProperty> => {
            const [valueShape, description] = await Promise.all([
                resolveTypeReference(property.valueType, types),
                maybeSerializeMdxContent(property.description),
            ]);
            return {
                key: property.key,
                valueShape,
                description,
                availability: property.availability,
                hidden: false,
            };
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
        return apiPackage.items.flatMap((item) => {
            if (item.type === "subpackage") {
                return getApiDefinitions(item);
            }
            return [{ ...item, package: apiPackage }];
        });
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
    items: ResolvedPackageItem[];
    slug: readonly string[];
}

export type ResolvedPackageItem =
    | ResolvedEndpointDefinition
    | ResolvedWebhookDefinition
    | ResolvedWebSocketChannel
    | ResolvedSubpackage;

interface ResolvedPackageItemVisitor<T> {
    endpoint(item: ResolvedEndpointDefinition): T;
    webhook(item: ResolvedWebhookDefinition): T;
    websocket(item: ResolvedWebSocketChannel): T;
    subpackage(item: ResolvedSubpackage): T;
}

export const ResolvedPackageItem = {
    visit: <T>(item: ResolvedPackageItem, visitor: ResolvedPackageItemVisitor<T>): T => {
        switch (item.type) {
            case "endpoint":
                return visitor.endpoint(item);
            case "webhook":
                return visitor.webhook(item);
            case "websocket":
                return visitor.websocket(item);
            case "subpackage":
                return visitor.subpackage(item);
        }
    },
};

export type ResolvedApiDefinition =
    | ResolvedApiDefinition.Endpoint
    | ResolvedApiDefinition.Webhook
    | ResolvedApiDefinition.WebSocket;

export declare namespace ResolvedApiDefinition {
    export interface Endpoint extends ResolvedEndpointDefinition {
        package: ResolvedApiDefinitionPackage;
    }

    export interface Webhook extends ResolvedWebhookDefinition {
        package: ResolvedApiDefinitionPackage;
    }

    export interface WebSocket extends ResolvedWebSocketChannel {
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

export interface ResolvedSubpackage extends WithMetadata, ResolvedWithApiDefinition {
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

export interface ResolvedEndpointDefinition extends WithMetadata {
    type: "endpoint";
    id: APIV1Read.EndpointId;
    apiSectionId: FdrAPI.ApiDefinitionId;
    apiPackageId: FdrAPI.ApiDefinitionId | APIV1Read.SubpackageId;
    slug: string[];
    auth: APIV1Read.ApiAuth | undefined;
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

export type ResolvedExampleEndpointRequest =
    | ResolvedExampleEndpointRequest.Json
    | ResolvedExampleEndpointRequest.Form
    | ResolvedExampleEndpointRequest.Stream;

export declare namespace ResolvedExampleEndpointRequest {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface Form {
        type: "form";
        value: Record<string, ResolvedFormValue>;
    }

    interface Stream {
        type: "stream";
        fileName: string;
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
            value: json.value != null ? safeSortKeysByShape(json.value, shape, resolvedTypes) : undefined,
        }),
        form: (form) => ({
            type: "form",
            value: mapValues(form.value, (v) =>
                visitDiscriminatedUnion(v, "type")._visit<ResolvedFormValue>({
                    filenameWithData: (value) => ({ type: "file", fileName: value.filename }),
                    json: (value) => ({ type: "json", value: value.value }),
                    filename: (value) => ({ type: "file", fileName: value.value }),
                    _other: () => ({ type: "json", value: undefined }), // TODO: handle other types
                }),
            ),
        }),
        _other: () => undefined,
    });
}

export type ResolvedFormValue = ResolvedFormValue.Json | ResolvedFormValue.SingleFile | ResolvedFormValue.MultipleFiles;

export declare namespace ResolvedFormValue {
    interface Json {
        type: "json";
        value: unknown | undefined;
    }

    interface SingleFile {
        type: "file";
        fileName: string;
    }

    interface MultipleFiles {
        type: "fileArray";
        fileNames: string[];
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
            value: json.value != null ? safeSortKeysByShape(json.value, shape, resolvedTypes) : undefined,
        }),
        filename: (filename) => ({ type: "filename", value: filename.value }),
        stream: (stream) => ({ type: "stream", value: stream.value }),
        _other: () => undefined,
    });
}

function safeSortKeysByShape(
    value: unknown,
    shape: ResolvedTypeShape | ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape | null | undefined,
    resolvedTypes: Record<string, ResolvedTypeDefinition>,
): unknown {
    try {
        return stripUndefines(sortKeysByShape(value, shape, resolvedTypes));
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to sort JSON keys by type shape", e);

        emitDatadogError(e, {
            context: "ApiPage",
            errorSource: "sortKeysByShape",
            errorDescription:
                "Failed to sort and strip undefines from JSON value, indicating a bug in the resolver. This error should be investigated.",
        });

        return value;
    }
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
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | undefined,
    // highlighter: Highlighter,
): ResolvedCodeSnippet[] {
    let toRet: ResolvedCodeSnippet[] = [];

    const curlCode = stringifyHttpRequestExampleToCurl(
        convertEndpointExampleToHttpRequestExample(endpoint, example, requestBody),
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
        toRet.push({
            name: undefined,
            language: "python",
            install: example.codeExamples.pythonSdk.install,
            code: example.codeExamples.pythonSdk.sync_client,
            // hast: highlight(highlighter, code, "python"),
            generated: true,
        });
    }

    if (example.codeExamples.typescriptSdk != null) {
        toRet.push({
            name: undefined,
            language: "typescript",
            install: example.codeExamples.typescriptSdk.install,
            code: example.codeExamples.typescriptSdk.client,
            // hast: highlight(highlighter, code, "typescript"),
            generated: true,
        });
    }

    if (example.codeExamples.goSdk != null) {
        toRet.push({
            name: undefined,
            language: "go",
            install: example.codeExamples.goSdk.install,
            code: example.codeExamples.goSdk.client,
            // hast: highlight(highlighter, code, "go"),
            generated: true,
        });
    }

    example.codeSamples.forEach((codeSample) => {
        const language = cleanLanguage(codeSample.language);
        // Remove any generated code snippets with the same language
        toRet = toRet.filter((snippet) => (snippet.generated ? snippet.language !== language : true));
        toRet.push({
            name: codeSample.name,
            language,
            install: codeSample.install,
            code: codeSample.code,
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

export interface ResolvedRequestBody extends WithMetadata {
    contentType: string;
    shape: ResolvedHttpRequestBodyShape;
}

export interface ResolvedError extends WithMetadata {
    shape: ResolvedTypeShape | undefined;
    statusCode: number;
    name: string | undefined;
}

export interface ResolvedObjectProperty extends WithMetadata {
    key: APIV1Read.PropertyKey;
    valueShape: ResolvedTypeShape;
    hidden: boolean; // should be hidden in API reference, but present in examples and API Playground
}

export interface ResolvedResponseBody extends WithMetadata {
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
    type: "websocket";
    id: string;
    slug: string[];
    name: string | undefined;
    description: string | undefined;
    availability: APIV1Read.Availability | undefined;
    auth: APIV1Read.ApiAuth | undefined;
    defaultEnvironment: APIV1Read.Environment | undefined;
    environments: APIV1Read.Environment[];
    path: ResolvedEndpointPathParts[];
    headers: ResolvedObjectProperty[];
    pathParameters: ResolvedObjectProperty[];
    queryParameters: ResolvedObjectProperty[];
    messages: ResolvedWebSocketMessage[];
    examples: APIV1Read.ExampleWebSocketSession[];
}

export interface ResolvedWebSocketMessage extends WithMetadata {
    type: APIV1Read.WebSocketMessageId;
    body: ResolvedTypeShape;
    displayName: string | undefined;
    origin: APIV1Read.WebSocketMessageOrigin;
}

export interface ResolvedWebhookDefinition extends WithMetadata {
    type: "webhook";
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

export interface ResolvedPayload extends WithMetadata {
    shape: ResolvedTypeShape;
}

export interface ResolvedObjectShape extends WithMetadata {
    name: string | undefined;
    type: "object";
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedUndiscriminatedUnionShapeVariant extends WithMetadata {
    displayName: string | undefined;
    shape: ResolvedTypeShape;
}

export interface ResolvedUndiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "undiscriminatedUnion";
    variants: ResolvedUndiscriminatedUnionShapeVariant[];
}

export interface ResolvedDiscriminatedUnionShapeVariant extends WithMetadata {
    discriminantValue: string;
    extends: string[];
    properties: ResolvedObjectProperty[];
}

export interface ResolvedDiscriminatedUnionShape extends WithMetadata {
    name: string | undefined;
    type: "discriminatedUnion";
    discriminant: string;
    variants: ResolvedDiscriminatedUnionShapeVariant[];
}

export interface ResolvedOptionalShape extends WithMetadata {
    type: "optional";
    shape: NonOptionalTypeShape;
    defaultsTo: unknown | undefined;
}

export interface ResolvedListShape extends WithMetadata {
    type: "list";
    shape: ResolvedTypeShape;
}

export interface ResolvedSetShape extends WithMetadata {
    type: "set";
    shape: ResolvedTypeShape;
}

export interface ResolvedMapShape extends WithMetadata {
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
    | (APIV1Read.TypeReference.Unknown & WithMetadata);

interface ResolvedEnumShape extends WithMetadata {
    name: string | undefined;
    type: "enum";
    values: ResolvedEnumValue[];
}

export interface ResolvedEnumValue extends WithMetadata {
    value: string;
}

interface ResolvedAliasShape extends WithMetadata {
    name: string | undefined;
    type: "alias";
    shape: ResolvedTypeShape;
}

export type ResolvedTypeShape =
    | ResolvedTypeDefinition
    | (APIV1Read.PrimitiveType & WithMetadata)
    | ResolvedOptionalShape
    | ResolvedListShape
    | ResolvedSetShape
    | ResolvedMapShape
    | (APIV1Read.LiteralType & WithMetadata)
    | (APIV1Read.TypeReference.Unknown & WithMetadata)
    | ResolvedReferenceShape;

export type DereferencedTypeShape = Exclude<ResolvedTypeShape, ResolvedReferenceShape>;
export type NonOptionalTypeShape = Exclude<DereferencedTypeShape, ResolvedOptionalShape>;

export interface ResolvedReferenceShape extends WithMetadata {
    type: "reference";
    typeId: string;
}

export declare namespace ResolvedFileUploadRequestProperty {
    interface BodyProperty extends ResolvedObjectProperty {
        type: "bodyProperty";
    }
}

export type ResolvedFileUploadRequestProperty = APIV1Read.FileProperty | ResolvedFileUploadRequestProperty.BodyProperty;

export interface ResolvedFileUploadRequest extends WithMetadata {
    name: string;
    properties: ResolvedFileUploadRequestProperty[];
}

export interface ResolvedFileUpload {
    type: "fileUpload";
    value: ResolvedFileUploadRequest | undefined;
}

export type ResolvedHttpRequestBodyShape =
    | ResolvedFileUpload
    | APIV1Read.HttpRequestBodyShape.Bytes
    | ResolvedTypeShape;

interface ResolvedHttpRequestBodyShapeVisitor<T> {
    fileUpload: (shape: ResolvedFileUpload) => T;
    bytes: (shape: APIV1Read.BytesRequest) => T;
    typeShape: (shape: ResolvedTypeShape) => T;
}

export function visitResolvedHttpRequestBodyShape<T>(
    shape: ResolvedHttpRequestBodyShape,
    visitor: ResolvedHttpRequestBodyShapeVisitor<T>,
): T {
    if (shape.type === "fileUpload") {
        return visitor.fileUpload(shape);
    } else if (shape.type === "bytes") {
        return visitor.bytes(shape);
    } else {
        return visitor.typeShape(shape);
    }
}

export interface ResolvedStreamShape {
    type: "stream";
    value: ResolvedTypeShape;
}

export type ResolvedHttpResponseBodyShape =
    | APIV1Read.HttpResponseBodyShape.FileDownload
    | APIV1Read.HttpResponseBodyShape.StreamingText
    | APIV1Read.HttpResponseBodyShape.StreamCondition
    | ResolvedStreamShape
    | ResolvedTypeShape;

interface ResolvedHttpResponseBodyShapeVisitor<T> {
    fileDownload: (shape: APIV1Read.HttpResponseBodyShape.FileDownload) => T;
    streamingText: (shape: APIV1Read.HttpResponseBodyShape.StreamingText) => T;
    streamCondition: (shape: APIV1Read.HttpResponseBodyShape.StreamCondition) => T;
    stream: (shape: ResolvedStreamShape) => T;
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
        case "stream":
            return visitor.stream(shape);
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
            return { type: "unknown", availability: undefined, description: undefined };
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

export async function unwrapReferenceRaw(
    shape: ResolvedTypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<DereferencedTypeShape> {
    if (shape.type === "reference") {
        const nestedShape = types[shape.typeId];
        if (nestedShape == null) {
            return { type: "unknown", availability: undefined, description: undefined };
        }
        return unwrapReferenceRaw(await resolveTypeDefinition(nestedShape, types), types);
    }
    return shape;
}

export async function unwrapOptionalRaw(
    shape: ResolvedTypeShape,
    types: Record<string, APIV1Read.TypeDefinition>,
): Promise<NonOptionalTypeShape> {
    shape = await unwrapReferenceRaw(shape, types);
    if (shape.type === "optional") {
        return unwrapOptionalRaw(shape.shape, types);
    }
    return shape;
}

// This hack is no longer needed since it was introduced for Hume's demo only.
// keeping this around in case we need to re-introduce it.

// HACK: remove this function when we have a proper way to merge content types
// function mergeContentTypes(definitions: ResolvedEndpointDefinition[]): ResolvedEndpointDefinition[] {
//     const toRet: ResolvedEndpointDefinition[] = [];

//     definitions.forEach((definition) => {
//         if (!definition.id.endsWith("_multipart")) {
//             toRet.push(definition);
//         }
//     });

//     definitions.forEach((definition) => {
//         if (definition.id.endsWith("_multipart")) {
//             const baseId = definition.id.replace("_multipart", "");
//             const baseDefinition = toRet.find((def) => def.id === baseId);
//             if (baseDefinition) {
//                 baseDefinition.requestBody = [...baseDefinition.requestBody, ...definition.requestBody];
//             } else {
//                 toRet.push(definition);
//             }
//         }
//     });

//     return toRet;
// }
