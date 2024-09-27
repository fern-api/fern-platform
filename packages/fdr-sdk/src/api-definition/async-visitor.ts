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

export class AsyncVisitor {
    public static with(visitor: ApiDefinitionVisitor): AsyncVisitor {
        return new AsyncVisitor(visitor);
    }

    private visitor: ApiDefinitionVisitor;
    private constructor(visitor: ApiDefinitionVisitor) {
        this.visitor = this.#wrapVisitor(visitor);
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
    visitApiDefinition = async (api: Latest.ApiDefinition): Promise<Latest.ApiDefinition> => {
        const endpointsPromise = Promise.all(
            Object.entries(api.endpoints).map(async ([id, endpoint]) => [
                id,
                await this.visitor.EndpointDefinition(endpoint),
            ]),
        );

        const websocketsPromise = Promise.all(
            Object.entries(api.websockets).map(async ([id, websocket]) => [
                id,
                await this.visitor.WebSocketChannel(websocket),
            ]),
        );

        const webhooksPromise = Promise.all(
            Object.entries(api.webhooks).map(async ([id, webhook]) => [
                id,
                await this.visitor.WebhookDefinition(webhook),
            ]),
        );

        const typesPromise = Promise.all(
            Object.entries(api.types).map(async ([id, type]) => [id, await this.visitor.TypeDefinition(type)]),
        );

        const globalHeadersPromise = Promise.all(
            api.globalHeaders?.map((header) => this.visitor.ObjectProperty(header)) ?? [],
        );

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
    };

    #wrapVisitor = (visitor: ApiDefinitionVisitor): ApiDefinitionVisitor => {
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

            EndpointDefinition: async (endpoint) => visitor.EndpointDefinition(await this.visitEndpoint(endpoint)),
            HttpRequest: async (request) => visitor.HttpRequest(await this.visitHttpRequest(request)),
            HttpResponse: async (response) => visitor.HttpResponse(await this.visitHttpResponse(response)),
            ErrorResponse: async (error) => visitor.ErrorResponse(await this.visitErrorResponse(error)),
            ExampleEndpointCall: async (example) =>
                visitor.ExampleEndpointCall(await this.visitExampleEndpointCall(example)),
            WebhookDefinition: async (webhook) => visitor.WebhookDefinition(await this.visitWebhookDefinition(webhook)),
            WebhookPayload: async (payload) => visitor.WebhookPayload(await this.visitWebhookPayload(payload)),
            WebSocketChannel: async (channel) => visitor.WebSocketChannel(await this.visitWebSocketChannel(channel)),
            WebSocketMessage: async (message) => visitor.WebSocketMessage(await this.visitWebSocketMessage(message)),
            TypeDefinition: async (type) => visitor.TypeDefinition(await this.visitTypeDefinition(type)),
            TypeShape: async (shape) => visitor.TypeShape(await this.visitTypeShape(shape)),
            ObjectType: async (type) => visitor.ObjectType(await this.visitObjectType(type)),
            DiscriminatedUnionVariant: async (variant) =>
                visitor.DiscriminatedUnionVariant(await this.visitDiscriminatedUnionVariant(variant)),
            FormDataRequest: async (request) => visitor.FormDataRequest(await this.visitFormDataRequest(request)),
            FormDataField: async (field) => visitor.FormDataField(await this.visitFormDataField(field)),
        };
        return innerVisitor;
    };

    visitEndpoint = async (endpoint: Latest.EndpointDefinition): Promise<Latest.EndpointDefinition> => {
        const pathParametersPromise = Promise.all(endpoint.pathParameters?.map(this.visitor.ObjectProperty) ?? []);
        const queryParametersPromise = Promise.all(endpoint.queryParameters?.map(this.visitor.ObjectProperty) ?? []);
        const requestHeadersPromise = Promise.all(endpoint.requestHeaders?.map(this.visitor.ObjectProperty) ?? []);
        const responseHeadersPromise = Promise.all(endpoint.requestHeaders?.map(this.visitor.ObjectProperty) ?? []);
        const requestPromise = endpoint.request ? this.visitor.HttpRequest(endpoint.request) : undefined;
        const responsePromise = endpoint.response ? this.visitor.HttpResponse(endpoint.response) : undefined;
        const errorsPromise = Promise.all(endpoint.errors?.map((error) => this.visitor.ErrorResponse(error)) ?? []);
        const examplePromise = Promise.all(
            endpoint.examples?.map((example) => this.visitor.ExampleEndpointCall(example)) ?? [],
        );

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
    };

    visitHttpRequest = async (request: Latest.HttpRequest): Promise<Latest.HttpRequest> => {
        const bodyPromise = visitDiscriminatedUnion(request.body)._visit<AsyncOrSync<Latest.HttpRequestBodyShape>>({
            object: async (value) => ({ ...value, ...(await this.visitor.ObjectType(value)) }),
            alias: identity,
            bytes: identity,
            formData: async (value) => ({ ...value, ...(await this.visitor.FormDataRequest(value)) }),
        });
        return { ...request, body: await bodyPromise };
    };

    visitFormDataField = async (field: Latest.FormDataField): Promise<Latest.FormDataField> => {
        return visitDiscriminatedUnion(field)._visit<Promise<Latest.FormDataField>>({
            file: async (value) => ({ ...value, ...(await this.visitor.FormDataFile(value)) }),
            files: async (value) => ({ ...value, ...(await this.visitor.FormDataFiles(value)) }),
            property: async (value) => ({ ...value, ...(await this.visitor.ObjectProperty(value)) }),
        });
    };

    visitHttpResponse = async (response: Latest.HttpResponse): Promise<Latest.HttpResponse> => {
        const bodyPromise = visitDiscriminatedUnion(response.body)._visit<AsyncOrSync<Latest.HttpResponseBodyShape>>({
            object: async (value) => ({ ...value, ...(await this.visitor.ObjectType(value)) }),
            alias: identity,
            fileDownload: identity,
            streamingText: identity,
            stream: async (value) => ({ ...value, shape: await this.visitor.TypeShape(value.shape) }),
        });
        return { ...response, body: await bodyPromise };
    };

    visitObjectType = async (type: Latest.ObjectType): Promise<Latest.ObjectType> => {
        const properties = await Promise.all(type.properties.map(this.visitor.ObjectProperty));
        return { ...type, properties };
    };

    visitErrorResponse = async (error: Latest.ErrorResponse): Promise<Latest.ErrorResponse> => {
        const shapePromise = error.shape ? this.visitor.TypeShape(error.shape) : undefined;
        const examplesPromise = Promise.all(error.examples?.map(this.visitor.ErrorExample) ?? []);
        const [shape, examples] = await Promise.all([shapePromise, examplesPromise]);
        return { ...error, shape, examples: examples.length > 0 ? examples : undefined };
    };

    visitExampleEndpointCall = async (example: Latest.ExampleEndpointCall): Promise<Latest.ExampleEndpointCall> => {
        const snippetsEntries = (
            await Promise.all(
                Object.entries(example.snippets ?? {}).map(
                    async ([language, snippets]) =>
                        [language, await Promise.all(snippets.map(this.visitor.CodeSnippet))] as const,
                ),
            )
        ).filter(([, snippets]) => snippets.length > 0);

        const snippets = Object.fromEntries(snippetsEntries);
        return {
            ...example,
            snippets: snippetsEntries.length > 0 ? snippets : undefined,
        };
    };
    visitWebhookDefinition = async (webhook: Latest.WebhookDefinition): Promise<Latest.WebhookDefinition> => {
        const payloadPromise = webhook.payload != null ? this.visitor.WebhookPayload(webhook.payload) : undefined;
        const headersPromise = Promise.all(webhook.headers?.map(this.visitor.ObjectProperty) ?? []);
        const [payload, headers] = await Promise.all([payloadPromise, headersPromise]);
        return {
            ...webhook,
            payload,
            headers: headers.length > 0 ? headers : undefined,
        };
    };

    visitWebhookPayload = async (payload: Latest.WebhookPayload): Promise<Latest.WebhookPayload> => {
        const bodyPromise = this.visitor.TypeShape(payload.shape);
        return { ...payload, shape: await bodyPromise };
    };

    visitWebSocketChannel = async (channel: Latest.WebSocketChannel): Promise<Latest.WebSocketChannel> => {
        const pathParametersPromise = Promise.all(channel.pathParameters?.map(this.visitor.ObjectProperty) ?? []);
        const queryParametersPromise = Promise.all(channel.queryParameters?.map(this.visitor.ObjectProperty) ?? []);
        const requestHeadersPromise = Promise.all(channel.requestHeaders?.map(this.visitor.ObjectProperty) ?? []);
        const messagesPromise = Promise.all(channel.messages.map(this.visitor.WebSocketMessage));
        const examplesPromise = Promise.all(channel.examples?.map(this.visitor.ExampleWebSocketSession) ?? []);
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
    };

    visitWebSocketMessage = async (message: Latest.WebSocketMessage): Promise<Latest.WebSocketMessage> => {
        const bodyPromise = this.visitor.TypeShape(message.body);
        return {
            ...message,
            body: await bodyPromise,
        };
    };

    visitTypeShape = async (shape: Latest.TypeShape): Promise<Latest.TypeShape> => {
        return await visitDiscriminatedUnion(shape)._visit<AsyncOrSync<Latest.TypeShape>>({
            object: async (value) => ({ ...value, ...(await this.visitor.ObjectType(value)) }),
            alias: identity,
            enum: async (value) => ({ ...value, values: await Promise.all(value.values.map(this.visitor.EnumValue)) }),
            undiscriminatedUnion: async (value) => ({
                ...value,
                variants: await Promise.all(value.variants.map(this.visitor.UndiscriminatedUnionVariant)),
            }),
            discriminatedUnion: async (value) => ({
                ...value,
                variants: await Promise.all(value.variants.map(this.visitor.DiscriminatedUnionVariant)),
            }),
        });
    };

    visitFormDataRequest = async (request: Latest.FormDataRequest): Promise<Latest.FormDataRequest> => {
        return {
            ...request,
            fields: await Promise.all(request.fields.map(this.visitor.FormDataField)),
        };
    };

    visitTypeDefinition = async (type: Latest.TypeDefinition): Promise<Latest.TypeDefinition> => {
        return {
            ...type,
            shape: await this.visitor.TypeShape(type.shape),
        };
    };

    visitDiscriminatedUnionVariant = async (
        variant: Latest.DiscriminatedUnionVariant,
    ): Promise<Latest.DiscriminatedUnionVariant> => {
        return {
            ...variant,
            ...(await this.visitor.ObjectType(variant)),
        };
    };
}
