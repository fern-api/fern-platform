import { AsyncOrSync } from "ts-essentials";
import { APIV1UI } from "../client";
import { visitDiscriminatedUnion } from "../utils";
import { identity } from "../utils/lodash/identity";

/**
 * Visitor for API definitions.
 * This is used to traverse the API definition and apply async functions to each node.
 */
export interface ApiDefinitionVisitor {
    Parameter(parameter: APIV1UI.Parameter): AsyncOrSync<APIV1UI.Parameter>;

    // endpoints
    EndpointDefinition(endpoint: APIV1UI.EndpointDefinition): AsyncOrSync<APIV1UI.EndpointDefinition>;
    HttpRequest(request: APIV1UI.HttpRequest): AsyncOrSync<APIV1UI.HttpRequest>;
    HttpResponse(response: APIV1UI.HttpResponse): AsyncOrSync<APIV1UI.HttpResponse>;
    ErrorResponse(error: APIV1UI.ErrorResponse): AsyncOrSync<APIV1UI.ErrorResponse>;
    ExampleEndpointCall(example: APIV1UI.ExampleEndpointCall): AsyncOrSync<APIV1UI.ExampleEndpointCall>;
    CodeSnippet(snippet: APIV1UI.CodeSnippet): AsyncOrSync<APIV1UI.CodeSnippet>;
    ErrorExample(error: APIV1UI.ErrorExample): AsyncOrSync<APIV1UI.ErrorExample>;

    // webhooks
    WebhookDefinition(webhook: APIV1UI.WebhookDefinition): AsyncOrSync<APIV1UI.WebhookDefinition>;
    WebhookPayload(payload: APIV1UI.WebhookPayload): AsyncOrSync<APIV1UI.WebhookPayload>;

    // websockets
    WebSocketChannel(channel: APIV1UI.WebSocketChannel): AsyncOrSync<APIV1UI.WebSocketChannel>;
    WebSocketMessage(message: APIV1UI.WebSocketMessage): AsyncOrSync<APIV1UI.WebSocketMessage>;
    ExampleWebSocketSession(session: APIV1UI.ExampleWebSocketSession): AsyncOrSync<APIV1UI.ExampleWebSocketSession>;

    // types
    TypeDefinition(type: APIV1UI.TypeDefinition): AsyncOrSync<APIV1UI.TypeDefinition>;
    TypeShape(shape: APIV1UI.TypeShape): AsyncOrSync<APIV1UI.TypeShape>;
    ObjectType(property: APIV1UI.ObjectType): AsyncOrSync<APIV1UI.ObjectType>;
    ObjectProperty(property: APIV1UI.ObjectProperty): AsyncOrSync<APIV1UI.ObjectProperty>;
    EnumValue(value: APIV1UI.EnumValue): AsyncOrSync<APIV1UI.EnumValue>;
    UndiscriminatedUnionVariant(
        variant: APIV1UI.UndiscriminatedUnionVariant,
    ): AsyncOrSync<APIV1UI.UndiscriminatedUnionVariant>;
    DiscriminatedUnionVariant(
        variant: APIV1UI.DiscriminatedUnionVariant,
    ): AsyncOrSync<APIV1UI.DiscriminatedUnionVariant>;
    FormDataRequest(request: APIV1UI.FormDataRequest): AsyncOrSync<APIV1UI.FormDataRequest>;
    FormDataField(field: APIV1UI.FormDataField): AsyncOrSync<APIV1UI.FormDataField>;
    FormDataFile(file: APIV1UI.FormDataFile): AsyncOrSync<APIV1UI.FormDataFile>;
    FormDataFiles(files: APIV1UI.FormDataFiles): AsyncOrSync<APIV1UI.FormDataFiles>;
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
    api: APIV1UI.ApiDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.ApiDefinition> {
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

    const globalHeadersPromise = Promise.all(api.globalHeaders?.map((header) => visitor.Parameter(header)) ?? []);

    const [endpoints, websockets, webhooks, types, globalHeaders] = await Promise.all([
        endpointsPromise,
        websocketsPromise,
        webhooksPromise,
        typesPromise,
        globalHeadersPromise,
    ]);

    return {
        id: api.id,
        nodeId: api.nodeId,
        endpoints: Object.fromEntries(endpoints),
        websockets: Object.fromEntries(websockets),
        webhooks: Object.fromEntries(webhooks),
        types: Object.fromEntries(types),
        globalHeaders,
        auth: api.auth,
    };
}

function wrapVisitor(visitor: ApiDefinitionVisitor): ApiDefinitionVisitor {
    const innerVisitor: ApiDefinitionVisitor = {
        /**
         * The following types do not have any nested types that need to be visited.
         */

        Parameter: visitor.Parameter,
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
    endpoint: APIV1UI.EndpointDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.EndpointDefinition> {
    const pathParametersPromise = Promise.all(endpoint.pathParameters.map(visitor.Parameter));
    const queryParametersPromise = Promise.all(endpoint.queryParameters.map(visitor.Parameter));
    const requestHeadersPromise = Promise.all(endpoint.requestHeaders.map(visitor.Parameter));
    const responseHeadersPromise = Promise.all(endpoint.requestHeaders.map(visitor.Parameter));
    const requestPromise = endpoint.request ? visitor.HttpRequest(endpoint.request) : undefined;
    const responsePromise = endpoint.response ? visitor.HttpResponse(endpoint.response) : undefined;
    const errorsPromise = Promise.all(endpoint.errors?.map((error) => visitor.ErrorResponse(error)) ?? []);
    const examplePromise = Promise.all(endpoint.examples.map((example) => visitor.ExampleEndpointCall(example)));

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
        pathParameters,
        queryParameters,
        requestHeaders,
        responseHeaders,
        request,
        response,
        errors,
        examples,
    };
}

async function visitHttpRequest(
    request: APIV1UI.HttpRequest,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.HttpRequest> {
    const bodyPromise = visitDiscriminatedUnion(request.body)._visit<AsyncOrSync<APIV1UI.HttpRequestBodyShape>>({
        object: async (value) => ({ ...value, ...(await visitor.ObjectType(value)) }),
        reference: identity,
        bytes: identity,
        formData: async (value) => ({ ...value, ...(await visitor.FormDataRequest(value)) }),
    });
    return { ...request, body: await bodyPromise };
}

function visitFormDataField(
    field: APIV1UI.FormDataField,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.FormDataField> {
    return visitDiscriminatedUnion(field)._visit<Promise<APIV1UI.FormDataField>>({
        file: async (value) => ({ ...value, ...(await visitor.FormDataFile(value)) }),
        files: async (value) => ({ ...value, ...(await visitor.FormDataFiles(value)) }),
        property: async (value) => ({ ...value, ...(await visitor.ObjectProperty(value)) }),
    });
}

async function visitHttpResponse(
    response: APIV1UI.HttpResponse,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.HttpResponse> {
    const bodyPromise = visitDiscriminatedUnion(response.body)._visit<AsyncOrSync<APIV1UI.HttpResponseBodyShape>>({
        object: async (value) => ({ ...value, ...(await visitor.ObjectType(value)) }),
        reference: identity,
        fileDownload: identity,
        streamingText: identity,
        stream: async (value) => ({ ...value, shape: await visitor.TypeShape(value.shape) }),
    });
    return { ...response, body: await bodyPromise };
}

async function visitObjectType(type: APIV1UI.ObjectType, visitor: ApiDefinitionVisitor): Promise<APIV1UI.ObjectType> {
    const properties = await Promise.all(type.properties.map(visitor.ObjectProperty));
    return { ...type, properties };
}

async function visitErrorResponse(
    error: APIV1UI.ErrorResponse,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.ErrorResponse> {
    const typePromise = error.type ? visitor.TypeShape(error.type) : undefined;
    const examplesPromise = Promise.all(error.examples?.map(visitor.ErrorExample) ?? []);
    const [type, examples] = await Promise.all([typePromise, examplesPromise]);
    return { ...error, type, examples };
}

export async function visitExampleEndpointCall(
    example: APIV1UI.ExampleEndpointCall,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.ExampleEndpointCall> {
    return {
        ...example,
        snippets: await Promise.all(example.snippets.map(visitor.CodeSnippet)),
    };
}
async function visitWebhookDefinition(
    webhook: APIV1UI.WebhookDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.WebhookDefinition> {
    const payloadPromise = visitor.WebhookPayload(webhook.payload);
    const headersPromise = Promise.all(webhook.headers.map(visitor.Parameter));
    const [payload, headers] = await Promise.all([payloadPromise, headersPromise]);
    return {
        ...webhook,
        payload,
        headers,
    };
}

async function visitWebhookPayload(
    payload: APIV1UI.WebhookPayload,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.WebhookPayload> {
    const bodyPromise = visitor.TypeShape(payload.body);
    return { ...payload, body: await bodyPromise };
}

async function visitWebSocketChannel(
    channel: APIV1UI.WebSocketChannel,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.WebSocketChannel> {
    const pathParametersPromise = Promise.all(channel.pathParameters.map(visitor.Parameter));
    const queryParametersPromise = Promise.all(channel.queryParameters.map(visitor.Parameter));
    const requestHeadersPromise = Promise.all(channel.requestHeaders.map(visitor.Parameter));
    const messagesPromise = Promise.all(channel.messages.map(visitor.WebSocketMessage));
    const examplesPromise = Promise.all(channel.examples.map(visitor.ExampleWebSocketSession));
    const [pathParameters, queryParameters, requestHeaders, messages, examples] = await Promise.all([
        pathParametersPromise,
        queryParametersPromise,
        requestHeadersPromise,
        messagesPromise,
        examplesPromise,
    ]);
    return {
        ...channel,
        pathParameters,
        queryParameters,
        requestHeaders,
        messages,
        examples,
    };
}

async function visitWebSocketMessage(
    message: APIV1UI.WebSocketMessage,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.WebSocketMessage> {
    const bodyPromise = visitor.TypeShape(message.body);
    return {
        ...message,
        body: await bodyPromise,
    };
}

async function visitTypeShape(shape: APIV1UI.TypeShape, visitor: ApiDefinitionVisitor): Promise<APIV1UI.TypeShape> {
    return await visitDiscriminatedUnion(shape)._visit<AsyncOrSync<APIV1UI.TypeShape>>({
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
    request: APIV1UI.FormDataRequest,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.FormDataRequest> {
    return {
        ...request,
        fields: await Promise.all(request.fields.map(visitor.FormDataField)),
    };
}

async function visitTypeDefinition(
    type: APIV1UI.TypeDefinition,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.TypeDefinition> {
    return {
        ...type,
        shape: await visitor.TypeShape(type.shape),
    };
}

async function visitDiscriminatedUnionVariant(
    variant: APIV1UI.DiscriminatedUnionVariant,
    visitor: ApiDefinitionVisitor,
): Promise<APIV1UI.DiscriminatedUnionVariant> {
    return {
        ...variant,
        additionalProperties: await visitor.ObjectType(variant.additionalProperties),
    };
}
