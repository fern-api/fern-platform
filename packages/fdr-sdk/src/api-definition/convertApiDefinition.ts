import { APIV1Read, APIV1UI } from "../client";
import { NodeCollector, ReadApiDefinitionHolder } from "../navigation";
import { FernNavigation } from "../navigation/generated";
import { createBreadcrumbs } from "../navigation/utils";
import { visitDiscriminatedUnion } from "../utils";
import { identity } from "../utils/lodash/identity";
import mapValue from "../utils/lodash/mapValues";
import { resolveCodeSnippets } from "./snippets/resolveCodeSnippets";
import { safeSortKeysByShape } from "./sortKeysByShape";

interface Flags {
    useJavaScriptAsTypeScript: boolean;
    alwaysEnableJavaScriptFetch: boolean;
    usesApplicationJsonInFormDataValue: boolean;
}

export function convertApiDefinition(
    collector: NodeCollector,
    holder: ReadApiDefinitionHolder,
    flags: Flags,
): APIV1UI.ApiDefinition {
    const apiNodeCollector = collector.apis.get(FernNavigation.ApiDefinitionId(holder.api.id));
    if (!apiNodeCollector) {
        throw new Error(`Could not find navigation node for API ${holder.api.id}`);
    }

    const types = Object.fromEntries(
        [...Object.entries(holder.api.types)].map(([key, value]) => [key, convertTypeDefinition(value)]),
    );

    const endpoints = Object.fromEntries(
        [...holder.endpoints].map(([endpointId, endpoint]) => {
            const node = apiNodeCollector.getEndpointNode(endpointId);
            if (!node) {
                throw new Error(`Could not find navigation node for endpoint ${endpointId}`);
            }
            return [node.id, convertHttpEndpointDefinition(endpoint, node, collector, types, holder.api.auth, flags)];
        }),
    );

    const websockets = Object.fromEntries(
        [...holder.webSockets].map(([websocketId, websocket]) => {
            const node = apiNodeCollector.getWebSocketNode(websocketId);
            if (!node) {
                throw new Error(`Could not find navigation node for websocket ${websocketId}`);
            }
            return [node.id, convertWebSocketChannel(websocket, node, collector, types)];
        }),
    );

    const webhooks = Object.fromEntries(
        [...holder.webhooks].map(([webhookId, webhook]) => {
            const node = apiNodeCollector.getWebhookNode(webhookId);
            if (!node) {
                throw new Error(`Could not find navigation node for webhook ${webhookId}`);
            }
            return [node.id, convertWebhookDefinition(webhook, node, collector, types)];
        }),
    );

    return {
        id: holder.api.id,
        nodeId: apiNodeCollector.rootNode.id,
        endpoints,
        websockets,
        webhooks,
        types,
        auth: holder.api.auth,
        globalHeaders: holder.api.globalHeaders?.map(convertPameters),
    };
}

/**
 * @param auth - this is only used in example generation, so that we can generate examples with auth
 */
function convertHttpEndpointDefinition(
    endpoint: APIV1Read.EndpointDefinition,
    node: FernNavigation.EndpointNode,
    collector: NodeCollector,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
    auth: APIV1Read.ApiAuth | undefined,
    flags: Flags,
): APIV1UI.EndpointDefinition {
    const request = endpoint.request
        ? { contentType: endpoint.request.contentType, body: convertHttpRequestBodyShape(endpoint.request.type) }
        : undefined;

    const response = endpoint.response
        ? {
              statusCode: endpoint.response.statusCode ?? 200,
              body: convertHttpResponseBodyShape(endpoint.response.type),
          }
        : undefined;

    const toRet: APIV1UI.EndpointDefinition = {
        id: endpoint.originalEndpointId ?? endpoint.id,
        title: node.title,
        nodeId: node.id,
        slug: node.slug,
        apiDefinitionId: node.apiDefinitionId,
        breadcrumbs: createBreadcrumbs(collector.getParents(node.id)),
        authed: endpoint.authed,
        defaultEnvironment: endpoint.defaultEnvironment,
        environments: endpoint.environments,
        method: endpoint.method,
        path: endpoint.path.parts,
        pathParameters: endpoint.path.pathParameters.map(convertPameters),
        queryParameters: endpoint.queryParameters.map(convertPameters),
        requestHeaders: endpoint.headers.map(convertPameters),
        responseHeaders: [], // this is not supported in the current Read API
        request,
        response,
        examples: [],
        snippetTemplates: endpoint.snippetTemplates,
        description: wrapDescription(endpoint.description),
        availability: endpoint.availability,
    };

    toRet.examples = endpoint.examples.map((example) => convertExampleEndpointCall(toRet, example, types, auth, flags));

    return toRet;
}

function convertWebSocketChannel(
    websocket: APIV1Read.WebSocketChannel,
    node: FernNavigation.WebSocketNode,
    collector: NodeCollector,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1UI.WebSocketChannel {
    const toRet: APIV1UI.WebSocketChannel = {
        id: websocket.id,
        title: node.title,
        nodeId: node.id,
        slug: node.slug,
        apiDefinitionId: node.apiDefinitionId,
        breadcrumbs: createBreadcrumbs(collector.getParents(node.id)),
        authed: websocket.auth,
        defaultEnvironment: websocket.defaultEnvironment,
        environments: websocket.environments,
        path: websocket.path.parts,
        pathParameters: websocket.path.pathParameters.map(convertPameters),
        queryParameters: websocket.queryParameters.map(convertPameters),
        requestHeaders: websocket.headers.map(convertPameters),
        messages: websocket.messages.map(convertWebSocketMessage),
        examples: [],
        description: wrapDescription(websocket.description),
        availability: websocket.availability,
    };

    toRet.examples = websocket.examples.map((example) => convertExampleWebSocketSession(toRet, example, types));

    return toRet;
}

function convertWebhookDefinition(
    webhook: APIV1Read.WebhookDefinition,
    node: FernNavigation.WebhookNode,
    collector: NodeCollector,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1UI.WebhookDefinition {
    const toRet: APIV1UI.WebhookDefinition = {
        id: webhook.id,
        title: node.title,
        nodeId: node.id,
        slug: node.slug,
        apiDefinitionId: node.apiDefinitionId,
        breadcrumbs: createBreadcrumbs(collector.getParents(node.id)),
        method: webhook.method,
        path: webhook.path,
        headers: webhook.headers.map(convertPameters),
        payload: {
            shape: convertJsonBodyShape(webhook.payload.type),
            description: wrapDescription(webhook.payload.description),
        },
        examples: [],
        description: wrapDescription(webhook.description),
        availability: undefined,
    };

    toRet.examples = webhook.examples.map((example) => sortExampleWebhookPayload(toRet, example, types));

    return toRet;
}

function wrapDescription(description: string | undefined): APIV1UI.Description | undefined {
    return description ? { type: "unresolved", value: description } : undefined;
}

function convertPameters(
    parameter: APIV1Read.QueryParameter | APIV1Read.PathParameter | APIV1Read.Header,
): APIV1UI.ObjectProperty {
    return {
        key: parameter.key,
        valueShape: convertTypeReference(parameter.type),
        description: wrapDescription(parameter.description),
        availability: parameter.availability,
    };
}

function convertHttpRequestBodyShape(request: APIV1Read.HttpRequestBodyShape): APIV1UI.HttpRequestBodyShape {
    return visitDiscriminatedUnion(request)._visit<APIV1UI.HttpRequestBodyShape>({
        object: convertObject,
        reference: (value) => ({ type: "reference", value: convertTypeReference(value.value) }),
        bytes: identity,
        formData: convertFormData,
        fileUpload: convertFileUpload,
    });
}

function convertHttpResponseBodyShape(response: APIV1Read.HttpResponseBodyShape): APIV1UI.HttpResponseBodyShape {
    return visitDiscriminatedUnion(response)._visit<APIV1UI.HttpResponseBodyShape>({
        object: convertObject,
        reference: (value) => ({ type: "reference", value: convertTypeReference(value.value) }),
        fileDownload: identity,
        streamingText: identity,
        stream: convertStream,
        streamCondition: () => {
            throw new Error("StreamCondition response is not supported");
        },
    });
}

function convertWebSocketMessage(message: APIV1Read.WebSocketMessage): APIV1UI.WebSocketMessage {
    return {
        ...message,
        description: wrapDescription(message.description),
        body: convertJsonBodyShape(message.body),
    };
}

function convertExampleWebSocketSession(
    channel: APIV1UI.WebSocketChannel,
    example: APIV1Read.ExampleWebSocketSession,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1UI.ExampleWebSocketSession {
    return {
        name: example.name,
        path: example.path,
        pathParameters: example.pathParameters,
        queryParameters: example.queryParameters,
        requestHeaders: example.headers,
        messages: example.messages.map((message) => sortExampleWebSocketMessage(channel, message, types)),
        description: wrapDescription(example.description),
    };
}

function convertJsonBodyShape(typeShape: APIV1Read.JsonBodyShape): APIV1UI.TypeShape {
    return visitDiscriminatedUnion(typeShape)._visit<APIV1UI.TypeShape>({
        object: convertObject,
        reference: (value) => ({ type: "alias", value: convertTypeReference(value.value) }),
    });
}

function convertTypeShape(shape: APIV1Read.TypeShape): APIV1UI.TypeShape {
    return visitDiscriminatedUnion(shape)._visit<APIV1UI.TypeShape>({
        object: convertObject,
        alias: (value) => ({ type: "alias", value: convertTypeReference(value.value) }),
        enum: convertEnum,
        undiscriminatedUnion: convertUndiscriminatedUnion,
        discriminatedUnion: convertDiscriminatedUnion,
    });
}

function convertTypeReference(typeRef: APIV1Read.TypeReference): APIV1UI.TypeReference {
    return visitDiscriminatedUnion(typeRef)._visit<APIV1UI.TypeReference>({
        id: identity,
        primitive: identity,
        unknown: identity,
        optional: (value) => ({
            type: "optional",
            defaultValue: value.defaultValue,
            itemShape: convertTypeReference(value.itemType),
        }),
        list: (value) => ({
            type: "list",
            itemShape: convertTypeReference(value.itemType),
        }),
        set: (value) => ({
            type: "set",
            itemShape: convertTypeReference(value.itemType),
        }),
        map: (value) => ({
            type: "map",
            keyShape: convertTypeReference(value.keyType),
            valueShape: convertTypeReference(value.valueType),
        }),
        literal: identity,
    });
}

function convertObject(object: APIV1Read.TypeShape.Object_): APIV1UI.TypeShape.Object_ {
    return {
        type: "object",
        ...convertObjectType(object),
    };
}

function convertObjectType(object: APIV1Read.ObjectType): APIV1UI.ObjectType {
    return {
        extends: object.extends,
        properties: object.properties.map(convertObjectProperty),
    };
}

function convertObjectProperty(property: APIV1Read.ObjectProperty): APIV1UI.ObjectProperty {
    return {
        key: property.key,
        valueShape: convertTypeReference(property.valueType),
        description: wrapDescription(property.description),
        availability: property.availability,
    };
}

function convertFormData(formData: APIV1Read.HttpRequestBodyShape.FormData): APIV1UI.HttpRequestBodyShape.FormData {
    return {
        type: "formData",
        name: formData.name,
        availability: formData.availability,
        description: wrapDescription(formData.description),
        fields: formData.properties.map(convertFormDataField),
    };
}

function convertFormDataField(field: APIV1Read.FormDataProperty): APIV1UI.FormDataField {
    return visitDiscriminatedUnion(field)._visit<APIV1UI.FormDataField>({
        file: (file) =>
            visitDiscriminatedUnion(file.value)._visit<APIV1UI.FormDataField>({
                file: (value) => ({
                    type: "file",
                    key: value.key,
                    description: wrapDescription(value.description),
                    availability: value.availability,
                    isOptional: value.isOptional,
                    contentType: value.contentType,
                }),
                fileArray: (value) => ({
                    type: "files",
                    key: value.key,
                    description: wrapDescription(value.description),
                    availability: value.availability,
                    isOptional: value.isOptional,
                    contentType: value.contentType,
                }),
            }),
        bodyProperty: (bodyProperty) => ({
            type: "property",
            key: bodyProperty.key,
            description: wrapDescription(bodyProperty.description),
            availability: bodyProperty.availability,
            valueShape: convertTypeReference(bodyProperty.valueType),
            contentType: bodyProperty.contentType,
        }),
    });
}

// handles deprecated FileUpload case
function convertFileUpload(fileUpload: APIV1Read.HttpRequestBodyShape.FileUpload): APIV1UI.HttpRequestBodyShape {
    if (fileUpload.value) {
        return {
            type: "formData",
            name: fileUpload.value.name,
            availability: fileUpload.value.availability,
            description: wrapDescription(fileUpload.value.description),
            fields: fileUpload.value.properties.map(convertFormDataField),
        };
    } else {
        return { type: "bytes", isOptional: false };
    }
}

function convertExampleEndpointCall(
    endpoint: APIV1UI.EndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
    auth: APIV1UI.ApiAuth | undefined,
    flags: Flags,
): APIV1UI.ExampleEndpointCall {
    return {
        name: example.name,
        description: wrapDescription(example.description),
        path: example.path,
        pathParameters: example.pathParameters,
        queryParameters: example.queryParameters,
        headers: example.headers,
        requestBody: sortRequestBody(endpoint, example.requestBodyV3, types),
        responseStatusCode: example.responseStatusCode,
        responseBody: sortResponseBody(endpoint, example.responseBodyV3, types),
        snippets: resolveCodeSnippets(endpoint, example, auth, flags),
    };
}

function convertTypeDefinition(type: APIV1Read.TypeDefinition): APIV1UI.TypeDefinition {
    return {
        description: wrapDescription(type.description),
        availability: type.availability,
        name: type.name,
        shape: convertTypeShape(type.shape),
    };
}

function convertEnum(enum_: APIV1Read.TypeShape.Enum): APIV1UI.TypeShape.Enum {
    return {
        type: "enum",
        default: enum_.default,
        values: enum_.values.map(
            (value): APIV1UI.EnumValue => ({
                description: wrapDescription(value.description),
                value: value.value,
            }),
        ),
    };
}

function convertUndiscriminatedUnion(
    union: APIV1Read.TypeShape.UndiscriminatedUnion,
): APIV1UI.TypeShape.UndiscriminatedUnion {
    return {
        type: "undiscriminatedUnion",
        variants: union.variants.map(
            (variant): APIV1UI.UndiscriminatedUnionVariant => ({
                description: wrapDescription(variant.description),
                displayName: variant.displayName,
                availability: variant.availability,
                shape: convertTypeReference(variant.type),
            }),
        ),
    };
}

function convertDiscriminatedUnion(
    union: APIV1Read.TypeShape.DiscriminatedUnion,
): APIV1UI.TypeShape.DiscriminatedUnion {
    return {
        type: "discriminatedUnion",
        discriminant: union.discriminant,
        variants: union.variants.map(
            (variant): APIV1UI.DiscriminatedUnionVariant => ({
                discriminantValue: variant.discriminantValue,
                description: wrapDescription(variant.description),
                displayName: variant.displayName,
                availability: variant.availability,
                additionalProperties: convertObjectType(variant.additionalProperties),
            }),
        ),
    };
}

function convertStream(stream: APIV1Read.HttpResponseBodyShape.Stream): APIV1UI.HttpResponseBodyShape.Stream {
    return {
        type: "stream",
        terminator: stream.terminator,
        shape: convertJsonBodyShape(stream.shape),
    };
}

function sortRequestBody(
    endpoint: APIV1UI.EndpointDefinition,
    requestBody: APIV1UI.ExampleEndpointCall["requestBody"] | undefined,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1Read.ExampleEndpointRequest | undefined {
    if (!requestBody) {
        return undefined;
    }

    return visitDiscriminatedUnion(requestBody)._visit<APIV1UI.ExampleEndpointCall["requestBody"]>({
        bytes: identity,
        json: (value) => ({
            type: "json",
            value: safeSortKeysByShape(value.value, endpoint.request?.body, types),
        }),
        form: (value) => ({
            ...value,
            value: mapValue(value.value, (field, key): APIV1Read.FormValue => {
                if (field.type === "json" && field.value) {
                    const formValueField =
                        endpoint.request?.body.type === "formData"
                            ? endpoint.request.body.fields.find((f) => f.key === key)
                            : undefined;

                    if (formValueField?.type === "property") {
                        return {
                            ...field,
                            value: safeSortKeysByShape(field.value, formValueField.valueShape, types),
                        };
                    }
                }
                return field;
            }),
        }),
    });
}

function sortResponseBody(
    endpoint: APIV1UI.EndpointDefinition,
    responseBody: APIV1UI.ExampleEndpointCall["responseBody"] | undefined,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1Read.ExampleEndpointResponse | undefined {
    if (!responseBody) {
        return undefined;
    }

    return visitDiscriminatedUnion(responseBody)._visit<APIV1UI.ExampleEndpointCall["responseBody"]>({
        json: (value) => ({
            type: "json",
            value: safeSortKeysByShape(value.value, endpoint.response?.body, types),
        }),
        filename: identity,

        // TODO(ajiang): I'm unsure about if sorting works on streaming responses because the schema today is based on union types. Write tests for them:
        stream: (value) => ({
            ...value,
            value: value.value.map((chunk) => safeSortKeysByShape(chunk, endpoint.response?.body, types)),
        }),
        sse: (value) => ({
            ...value,
            value: value.value.map((chunk) => ({
                ...chunk,
                data: safeSortKeysByShape(chunk.data, endpoint.response?.body, types),
            })),
        }),
    });
}

function sortExampleWebSocketMessage(
    channel: APIV1UI.WebSocketChannel,
    message: APIV1Read.ExampleWebSocketMessage,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1Read.ExampleWebSocketMessage {
    const shape = channel.messages.find((m) => m.type === message.type)?.body;
    return {
        ...message,
        body: safeSortKeysByShape(message.body, shape, types),
    };
}

function sortExampleWebhookPayload(
    webhook: APIV1UI.WebhookDefinition,
    example: APIV1Read.ExampleWebhookPayload,
    types: Record<APIV1UI.TypeId, APIV1UI.TypeDefinition>,
): APIV1Read.ExampleWebhookPayload {
    return {
        ...example,
        payload: safeSortKeysByShape(example.payload, webhook.payload.shape, types),
    };
}
