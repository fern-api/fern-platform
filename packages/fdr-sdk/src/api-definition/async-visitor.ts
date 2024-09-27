import identity from "@fern-ui/core-utils/identity";
import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { AsyncOrSync } from "ts-essentials";
import * as Latest from "./latest";

/**
 * Visitor for API definitions.
 * This is used to traverse the API definition and apply async functions to each node.
 */
export interface ApiDefinitionVisitor {
    // endpoints
    EndpointDefinition(endpoint: Latest.EndpointDefinition): AsyncOrSync<Latest.EndpointDefinition>;
    HttpRequest(request: Latest.HttpRequest): AsyncOrSync<Latest.HttpRequest>;
    HttpResponse(response: Latest.HttpResponse): AsyncOrSync<Latest.HttpResponse>;
    ErrorResponse(error: Latest.ErrorResponse): AsyncOrSync<Latest.ErrorResponse>;
    ExampleEndpointCall(example: Latest.ExampleEndpointCall): AsyncOrSync<Latest.ExampleEndpointCall>;
    CodeSnippet(snippet: Latest.CodeSnippet): AsyncOrSync<Latest.CodeSnippet>;
    ErrorExample(error: Latest.ErrorExample): AsyncOrSync<Latest.ErrorExample>;

    // webhooks
    WebhookDefinition(webhook: Latest.WebhookDefinition): AsyncOrSync<Latest.WebhookDefinition>;
    WebhookPayload(payload: Latest.WebhookPayload): AsyncOrSync<Latest.WebhookPayload>;

    // websockets
    WebSocketChannel(channel: Latest.WebSocketChannel): AsyncOrSync<Latest.WebSocketChannel>;
    WebSocketMessage(message: Latest.WebSocketMessage): AsyncOrSync<Latest.WebSocketMessage>;
    ExampleWebSocketSession(session: Latest.ExampleWebSocketSession): AsyncOrSync<Latest.ExampleWebSocketSession>;

    // types
    TypeDefinition(type: Latest.TypeDefinition): AsyncOrSync<Latest.TypeDefinition>;
    TypeShape(shape: Latest.TypeShape): AsyncOrSync<Latest.TypeShape>;
    ObjectType(property: Latest.ObjectType): AsyncOrSync<Latest.ObjectType>;
    ObjectProperty(property: Latest.ObjectProperty): AsyncOrSync<Latest.ObjectProperty>;
    EnumValue(value: Latest.EnumValue): AsyncOrSync<Latest.EnumValue>;
    UndiscriminatedUnionVariant(
        variant: Latest.UndiscriminatedUnionVariant,
    ): AsyncOrSync<Latest.UndiscriminatedUnionVariant>;
    DiscriminatedUnionVariant(variant: Latest.DiscriminatedUnionVariant): AsyncOrSync<Latest.DiscriminatedUnionVariant>;
    FormDataRequest(request: Latest.FormDataRequest): AsyncOrSync<Latest.FormDataRequest>;
    FormDataField(field: Latest.FormDataField): AsyncOrSync<Latest.FormDataField>;
    FormDataFile(file: Latest.FormDataFile): AsyncOrSync<Latest.FormDataFile>;
    FormDataFiles(files: Latest.FormDataFiles): AsyncOrSync<Latest.FormDataFiles>;
}

/**
 * Visits an API definition and applies the visitor transformations to each node.
 *
 * This function treats the API Definition as an AST. The purpose is to apply transformations to the "description" field of each node.
 *
 * @param api the API definition to visit
 * @param visitor the visitor to apply to the API definition
 * @returns the API definition with the visitor transformations applied
 */
export async function visitApiDefinition(
    api: Latest.ApiDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.ApiDefinition> {
    visitor = wrapVisitor(visitor);

    const endpointsPromise = Promise.all(
        Object.entries(api.endpoints).map(async ([id, endpoint]) => [id, await visitor.EndpointDefinition(endpoint)]),
    );

    const websocketsPromise = Promise.all(
        Object.entries(api.websockets).map(async ([id, websocket]) => [id, await visitor.WebSocketChannel(websocket)]),
    );

    const webhooksPromise = Promise.all(
        Object.entries(api.webhooks).map(async ([id, webhook]) => [id, await visitor.WebhookDefinition(webhook)]),
    );

    const typesPromise = Promise.all(
        Object.entries(api.types).map(async ([id, type]) => [id, await visitor.TypeDefinition(type)]),
    );

    const globalHeadersPromise = Promise.all(api.globalHeaders?.map((header) => visitor.ObjectProperty(header)) ?? []);

    const [endpoints, websockets, webhooks, types, globalHeaders] = await Promise.all([
        endpointsPromise,
        websocketsPromise,
        webhooksPromise,
        typesPromise,
        globalHeadersPromise,
    ]);

    return {
        id: api.id,
        endpoints: Object.fromEntries(endpoints),
        websockets: Object.fromEntries(websockets),
        webhooks: Object.fromEntries(webhooks),
        types: Object.fromEntries(types),
        globalHeaders,
        auths: api.auths,
        subpackages: api.subpackages,
    };
}

function wrapVisitor(visitor: ApiDefinitionVisitor): ApiDefinitionVisitor {
    const innerVisitor: ApiDefinitionVisitor = {
        /**
         * The following types do not have any nested types that need to be visited.
         */

        CodeSnippet: visitor.CodeSnippet,
        ErrorExample: visitor.ErrorExample,
        ExampleWebSocketSession: visitor.ExampleWebSocketSession,
        ObjectProperty: visitor.ObjectProperty,
        EnumValue: visitor.EnumValue,
        UndiscriminatedUnionVariant: visitor.UndiscriminatedUnionVariant,
        FormDataFile: visitor.FormDataFile,
        FormDataFiles: visitor.FormDataFiles,

        /**
         * The following types have nested types that need to be visited.
         */

        EndpointDefinition: async (endpoint) => visitor.EndpointDefinition(await visitEndpoint(endpoint, innerVisitor)),
        HttpRequest: async (request) => visitor.HttpRequest(await visitHttpRequest(request, innerVisitor)),
        HttpResponse: async (response) => visitor.HttpResponse(await visitHttpResponse(response, innerVisitor)),
        ErrorResponse: async (error) => visitor.ErrorResponse(await visitErrorResponse(error, innerVisitor)),
        ExampleEndpointCall: async (example) =>
            visitor.ExampleEndpointCall(await visitExampleEndpointCall(example, innerVisitor)),
        WebhookDefinition: async (webhook) =>
            visitor.WebhookDefinition(await visitWebhookDefinition(webhook, innerVisitor)),
        WebhookPayload: async (payload) => visitor.WebhookPayload(await visitWebhookPayload(payload, innerVisitor)),
        WebSocketChannel: async (channel) =>
            visitor.WebSocketChannel(await visitWebSocketChannel(channel, innerVisitor)),
        WebSocketMessage: async (message) =>
            visitor.WebSocketMessage(await visitWebSocketMessage(message, innerVisitor)),
        TypeDefinition: async (type) => visitor.TypeDefinition(await visitTypeDefinition(type, innerVisitor)),
        TypeShape: async (shape) => visitor.TypeShape(await visitTypeShape(shape, innerVisitor)),
        ObjectType: async (type) => visitor.ObjectType(await visitObjectType(type, innerVisitor)),
        DiscriminatedUnionVariant: async (variant) =>
            visitor.DiscriminatedUnionVariant(await visitDiscriminatedUnionVariant(variant, innerVisitor)),
        FormDataRequest: async (request) => visitor.FormDataRequest(await visitFormDataRequest(request, innerVisitor)),
        FormDataField: async (field) => visitor.FormDataField(await visitFormDataField(field, innerVisitor)),
    };
    return innerVisitor;
}

async function visitEndpoint(
    endpoint: Latest.EndpointDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.EndpointDefinition> {
    const pathParametersPromise = Promise.all(endpoint.pathParameters?.map(visitor.ObjectProperty) ?? []);
    const queryParametersPromise = Promise.all(endpoint.queryParameters?.map(visitor.ObjectProperty) ?? []);
    const requestHeadersPromise = Promise.all(endpoint.requestHeaders?.map(visitor.ObjectProperty) ?? []);
    const responseHeadersPromise = Promise.all(endpoint.requestHeaders?.map(visitor.ObjectProperty) ?? []);
    const requestPromise = endpoint.request ? visitor.HttpRequest(endpoint.request) : undefined;
    const responsePromise = endpoint.response ? visitor.HttpResponse(endpoint.response) : undefined;
    const errorsPromise = Promise.all(endpoint.errors?.map((error) => visitor.ErrorResponse(error)) ?? []);
    const examplePromise = Promise.all(endpoint.examples?.map((example) => visitor.ExampleEndpointCall(example)) ?? []);

    const [pathParameters, queryParameters, requestHeaders, responseHeaders, request, response, errors, examples] =
        await Promise.all([
            pathParametersPromise,
            queryParametersPromise,
            requestHeadersPromise,
            responseHeadersPromise,
            requestPromise,
            responsePromise,
            errorsPromise,
            examplePromise,
        ]);

    return {
        ...endpoint,
        pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
        queryParameters: queryParameters.length > 0 ? queryParameters : undefined,
        requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
        responseHeaders: responseHeaders.length > 0 ? responseHeaders : undefined,
        request,
        response,
        errors: errors.length > 0 ? errors : undefined,
        examples: examples.length > 0 ? examples : undefined,
    };
}

async function visitHttpRequest(
    request: Latest.HttpRequest,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.HttpRequest> {
    const bodyPromise = visitDiscriminatedUnion(request.body)._visit<AsyncOrSync<Latest.HttpRequestBodyShape>>({
        object: async (value) => ({ ...value, ...(await visitor.ObjectType(value)) }),
        alias: identity,
        bytes: identity,
        formData: async (value) => ({ ...value, ...(await visitor.FormDataRequest(value)) }),
    });
    return { ...request, body: await bodyPromise };
}

function visitFormDataField(field: Latest.FormDataField, visitor: ApiDefinitionVisitor): Promise<Latest.FormDataField> {
    return visitDiscriminatedUnion(field)._visit<Promise<Latest.FormDataField>>({
        file: async (value) => ({ ...value, ...(await visitor.FormDataFile(value)) }),
        files: async (value) => ({ ...value, ...(await visitor.FormDataFiles(value)) }),
        property: async (value) => ({ ...value, ...(await visitor.ObjectProperty(value)) }),
    });
}

async function visitHttpResponse(
    response: Latest.HttpResponse,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.HttpResponse> {
    const bodyPromise = visitDiscriminatedUnion(response.body)._visit<AsyncOrSync<Latest.HttpResponseBodyShape>>({
        object: async (value) => ({ ...value, ...(await visitor.ObjectType(value)) }),
        alias: identity,
        fileDownload: identity,
        streamingText: identity,
        stream: async (value) => ({ ...value, shape: await visitor.TypeShape(value.shape) }),
    });
    return { ...response, body: await bodyPromise };
}

async function visitObjectType(type: Latest.ObjectType, visitor: ApiDefinitionVisitor): Promise<Latest.ObjectType> {
    const properties = await Promise.all(type.properties.map(visitor.ObjectProperty));
    return { ...type, properties };
}

async function visitErrorResponse(
    error: Latest.ErrorResponse,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.ErrorResponse> {
    const shapePromise = error.shape ? visitor.TypeShape(error.shape) : undefined;
    const examplesPromise = Promise.all(error.examples?.map(visitor.ErrorExample) ?? []);
    const [shape, examples] = await Promise.all([shapePromise, examplesPromise]);
    return { ...error, shape, examples: examples.length > 0 ? examples : undefined };
}

export async function visitExampleEndpointCall(
    example: Latest.ExampleEndpointCall,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.ExampleEndpointCall> {
    const snippetsEntries = (
        await Promise.all(
            Object.entries(example.snippets ?? {}).map(
                async ([language, snippets]) =>
                    [language, await Promise.all(snippets.map(visitor.CodeSnippet))] as const,
            ),
        )
    ).filter(([, snippets]) => snippets.length > 0);

    const snippets = Object.fromEntries(snippetsEntries);
    return {
        ...example,
        snippets: snippetsEntries.length > 0 ? snippets : undefined,
    };
}
async function visitWebhookDefinition(
    webhook: Latest.WebhookDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.WebhookDefinition> {
    const payloadPromise = webhook.payload != null ? visitor.WebhookPayload(webhook.payload) : undefined;
    const headersPromise = Promise.all(webhook.headers?.map(visitor.ObjectProperty) ?? []);
    const [payload, headers] = await Promise.all([payloadPromise, headersPromise]);
    return {
        ...webhook,
        payload,
        headers: headers.length > 0 ? headers : undefined,
    };
}

async function visitWebhookPayload(
    payload: Latest.WebhookPayload,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.WebhookPayload> {
    const bodyPromise = visitor.TypeShape(payload.shape);
    return { ...payload, shape: await bodyPromise };
}

async function visitWebSocketChannel(
    channel: Latest.WebSocketChannel,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.WebSocketChannel> {
    const pathParametersPromise = Promise.all(channel.pathParameters?.map(visitor.ObjectProperty) ?? []);
    const queryParametersPromise = Promise.all(channel.queryParameters?.map(visitor.ObjectProperty) ?? []);
    const requestHeadersPromise = Promise.all(channel.requestHeaders?.map(visitor.ObjectProperty) ?? []);
    const messagesPromise = Promise.all(channel.messages.map(visitor.WebSocketMessage));
    const examplesPromise = Promise.all(channel.examples?.map(visitor.ExampleWebSocketSession) ?? []);
    const [pathParameters, queryParameters, requestHeaders, messages, examples] = await Promise.all([
        pathParametersPromise,
        queryParametersPromise,
        requestHeadersPromise,
        messagesPromise,
        examplesPromise,
    ]);
    return {
        ...channel,
        pathParameters: pathParameters.length > 0 ? pathParameters : undefined,
        queryParameters: queryParameters.length > 0 ? queryParameters : undefined,
        requestHeaders: requestHeaders.length > 0 ? requestHeaders : undefined,
        messages,
        examples: examples.length > 0 ? examples : undefined,
    };
}

async function visitWebSocketMessage(
    message: Latest.WebSocketMessage,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.WebSocketMessage> {
    const bodyPromise = visitor.TypeShape(message.body);
    return {
        ...message,
        body: await bodyPromise,
    };
}

async function visitTypeShape(shape: Latest.TypeShape, visitor: ApiDefinitionVisitor): Promise<Latest.TypeShape> {
    return await visitDiscriminatedUnion(shape)._visit<AsyncOrSync<Latest.TypeShape>>({
        object: async (value) => ({ ...value, ...(await visitor.ObjectType(value)) }),
        alias: identity,
        enum: async (value) => ({ ...value, values: await Promise.all(value.values.map(visitor.EnumValue)) }),
        undiscriminatedUnion: async (value) => ({
            ...value,
            variants: await Promise.all(value.variants.map(visitor.UndiscriminatedUnionVariant)),
        }),
        discriminatedUnion: async (value) => ({
            ...value,
            variants: await Promise.all(value.variants.map(visitor.DiscriminatedUnionVariant)),
        }),
    });
}

async function visitFormDataRequest(
    request: Latest.FormDataRequest,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.FormDataRequest> {
    return {
        ...request,
        fields: await Promise.all(request.fields.map(visitor.FormDataField)),
    };
}

async function visitTypeDefinition(
    type: Latest.TypeDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.TypeDefinition> {
    return {
        ...type,
        shape: await visitor.TypeShape(type.shape),
    };
}

async function visitDiscriminatedUnionVariant(
    variant: Latest.DiscriminatedUnionVariant,
    visitor: ApiDefinitionVisitor,
): Promise<Latest.DiscriminatedUnionVariant> {
    return {
        ...variant,
        ...(await visitor.ObjectType(variant)),
    };
}
