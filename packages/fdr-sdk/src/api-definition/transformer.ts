import type * as FernDocs from "@fern-api/fdr-sdk/docs";
import identity from "@fern-api/ui-core-utils/identity";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { AsyncOrSync } from "ts-essentials";
import * as Latest from "./latest";

/**
 * Visitor for API definitions.
 * This is used to traverse the API definition and apply async functions to each node.
 */
export interface ApiDefinitionVisitor {
    // endpoints
    EndpointDefinition(endpoint: Latest.EndpointDefinition, key: string): AsyncOrSync<Latest.EndpointDefinition>;
    HttpRequest(request: Latest.HttpRequest, key: string): AsyncOrSync<Latest.HttpRequest>;
    HttpResponse(response: Latest.HttpResponse, key: string): AsyncOrSync<Latest.HttpResponse>;
    ErrorResponse(error: Latest.ErrorResponse, key: string): AsyncOrSync<Latest.ErrorResponse>;
    ExampleEndpointCall(example: Latest.ExampleEndpointCall, key: string): AsyncOrSync<Latest.ExampleEndpointCall>;
    CodeSnippet(snippet: Latest.CodeSnippet, key: string): AsyncOrSync<Latest.CodeSnippet>;
    ErrorExample(error: Latest.ErrorExample, key: string): AsyncOrSync<Latest.ErrorExample>;

    // webhooks
    WebhookDefinition(webhook: Latest.WebhookDefinition, key: string): AsyncOrSync<Latest.WebhookDefinition>;
    WebhookPayload(payload: Latest.WebhookPayload, key: string): AsyncOrSync<Latest.WebhookPayload>;

    // websockets
    WebSocketChannel(channel: Latest.WebSocketChannel, key: string): AsyncOrSync<Latest.WebSocketChannel>;
    WebSocketMessage(message: Latest.WebSocketMessage, key: string): AsyncOrSync<Latest.WebSocketMessage>;
    ExampleWebSocketSession(
        session: Latest.ExampleWebSocketSession,
        key: string,
    ): AsyncOrSync<Latest.ExampleWebSocketSession>;

    // types
    TypeDefinition(type: Latest.TypeDefinition, key: string): AsyncOrSync<Latest.TypeDefinition>;
    TypeShape(shape: Latest.TypeShape, key: string): AsyncOrSync<Latest.TypeShape>;
    ObjectType(property: Latest.ObjectType, key: string): AsyncOrSync<Latest.ObjectType>;
    ObjectProperty(property: Latest.ObjectProperty, key: string): AsyncOrSync<Latest.ObjectProperty>;
    EnumValue(value: Latest.EnumValue, key: string): AsyncOrSync<Latest.EnumValue>;
    UndiscriminatedUnionVariant(
        variant: Latest.UndiscriminatedUnionVariant,
        key: string,
    ): AsyncOrSync<Latest.UndiscriminatedUnionVariant>;
    DiscriminatedUnionVariant(
        variant: Latest.DiscriminatedUnionVariant,
        key: string,
    ): AsyncOrSync<Latest.DiscriminatedUnionVariant>;
    FormDataRequest(request: Latest.FormDataRequest, key: string): AsyncOrSync<Latest.FormDataRequest>;
    FormDataField(field: Latest.FormDataField, key: string): AsyncOrSync<Latest.FormDataField>;
    FormDataFile(file: Latest.FormDataFile, key: string): AsyncOrSync<Latest.FormDataFile>;
    FormDataFiles(files: Latest.FormDataFiles, key: string): AsyncOrSync<Latest.FormDataFiles>;
}

export class Transformer {
    public static with(visitor: Partial<ApiDefinitionVisitor>): Transformer {
        return new Transformer({
            EndpointDefinition: visitor.EndpointDefinition ?? identity,
            HttpRequest: visitor.HttpRequest ?? identity,
            HttpResponse: visitor.HttpResponse ?? identity,
            ErrorResponse: visitor.ErrorResponse ?? identity,
            ExampleEndpointCall: visitor.ExampleEndpointCall ?? identity,
            CodeSnippet: visitor.CodeSnippet ?? identity,
            ErrorExample: visitor.ErrorExample ?? identity,
            WebhookDefinition: visitor.WebhookDefinition ?? identity,
            WebhookPayload: visitor.WebhookPayload ?? identity,
            WebSocketChannel: visitor.WebSocketChannel ?? identity,
            WebSocketMessage: visitor.WebSocketMessage ?? identity,
            ExampleWebSocketSession: visitor.ExampleWebSocketSession ?? identity,
            TypeDefinition: visitor.TypeDefinition ?? identity,
            TypeShape: visitor.TypeShape ?? identity,
            ObjectType: visitor.ObjectType ?? identity,
            ObjectProperty: visitor.ObjectProperty ?? identity,
            EnumValue: visitor.EnumValue ?? identity,
            UndiscriminatedUnionVariant: visitor.UndiscriminatedUnionVariant ?? identity,
            DiscriminatedUnionVariant: visitor.DiscriminatedUnionVariant ?? identity,
            FormDataRequest: visitor.FormDataRequest ?? identity,
            FormDataField: visitor.FormDataField ?? identity,
            FormDataFile: visitor.FormDataFile ?? identity,
            FormDataFiles: visitor.FormDataFiles ?? identity,
        });
    }

    public static descriptions(
        transformer: (description: FernDocs.MarkdownText, key: string) => AsyncOrSync<FernDocs.MarkdownText>,
    ): Transformer {
        async function internalTransformer<T extends Latest.WithDescription>(
            withDescription: T,
            key: string,
        ): Promise<T> {
            const description =
                withDescription.description != null ? await transformer(withDescription.description, key) : undefined;
            return { ...withDescription, description };
        }

        return Transformer.with({
            EndpointDefinition: internalTransformer,
            HttpRequest: internalTransformer,
            HttpResponse: internalTransformer,
            ErrorResponse: internalTransformer,
            ExampleEndpointCall: internalTransformer,
            CodeSnippet: internalTransformer,
            ErrorExample: internalTransformer,
            WebhookDefinition: internalTransformer,
            WebhookPayload: internalTransformer,
            WebSocketChannel: internalTransformer,
            WebSocketMessage: internalTransformer,
            ExampleWebSocketSession: internalTransformer,
            TypeDefinition: internalTransformer,
            ObjectProperty: internalTransformer,
            EnumValue: internalTransformer,
            UndiscriminatedUnionVariant: internalTransformer,
            DiscriminatedUnionVariant: internalTransformer,
            FormDataRequest: internalTransformer,
            FormDataField: internalTransformer,
            FormDataFile: internalTransformer,
            FormDataFiles: internalTransformer,
        });
    }

    /**
     * @internal visible for testing only
     */
    public static keys(collect: (key: string) => void): Transformer {
        function visit<T>(value: T, key: string): T {
            collect(key);
            return value;
        }
        return Transformer.with({
            EndpointDefinition: visit,
            HttpRequest: visit,
            HttpResponse: visit,
            ErrorResponse: visit,
            ExampleEndpointCall: visit,
            CodeSnippet: visit,
            ErrorExample: visit,
            WebhookDefinition: visit,
            WebhookPayload: visit,
            WebSocketChannel: visit,
            WebSocketMessage: visit,
            ExampleWebSocketSession: visit,
            TypeDefinition: visit,
            TypeShape: visit,
            ObjectType: visit,
            ObjectProperty: visit,
            EnumValue: visit,
            UndiscriminatedUnionVariant: visit,
            DiscriminatedUnionVariant: visit,
            FormDataRequest: visit,
            FormDataField: visit,
            FormDataFile: visit,
            FormDataFiles: visit,
        });
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
    apiDefinition = async (api: Latest.ApiDefinition): Promise<Latest.ApiDefinition> => {
        const endpointsPromise = Promise.all(
            Object.entries(api.endpoints).map(async ([id, endpoint]) => [
                id,
                await this.visitor.EndpointDefinition(endpoint, `${api.id}/endpoint/${id}`),
            ]),
        );

        const websocketsPromise = Promise.all(
            Object.entries(api.websockets).map(async ([id, websocket]) => [
                id,
                await this.visitor.WebSocketChannel(websocket, `${api.id}/websocket/${id}`),
            ]),
        );

        const webhooksPromise = Promise.all(
            Object.entries(api.webhooks).map(async ([id, webhook]) => [
                id,
                await this.visitor.WebhookDefinition(webhook, `${api.id}/webhoook/${id}`),
            ]),
        );

        const typesPromise = Promise.all(
            Object.entries(api.types).map(async ([id, type]) => [
                id,
                await this.visitor.TypeDefinition(type, `${api.id}/type-definition/${id}`),
            ]),
        );

        const globalHeadersPromise = Promise.all(
            api.globalHeaders?.map((header) =>
                this.visitor.ObjectProperty(header, `${api.id}/global-headers/${header.key}`),
            ) ?? [],
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

            EndpointDefinition: async (endpoint, key) =>
                visitor.EndpointDefinition(await this.endpoint(endpoint, key), key),
            HttpRequest: async (request, key) => visitor.HttpRequest(await this.httpRequest(request, key), key),
            HttpResponse: async (response, key) => visitor.HttpResponse(await this.httpResponse(response, key), key),
            ErrorResponse: async (error, key) => visitor.ErrorResponse(await this.errorResponse(error, key), key),
            ExampleEndpointCall: async (example, key) =>
                visitor.ExampleEndpointCall(await this.exampleEndpointCall(example, key), key),
            WebhookDefinition: async (webhook, key) =>
                visitor.WebhookDefinition(await this.webhookDefinition(webhook, key), key),
            WebhookPayload: async (payload, key) =>
                visitor.WebhookPayload(await this.webhookPayload(payload, key), key),
            WebSocketChannel: async (channel, key) =>
                visitor.WebSocketChannel(await this.webSocketChannel(channel, key), key),
            WebSocketMessage: async (message, key) =>
                visitor.WebSocketMessage(await this.webSocketMessage(message, key), key),
            TypeDefinition: async (type, key) => visitor.TypeDefinition(await this.typeDefinition(type, key), key),
            TypeShape: async (shape, key) => visitor.TypeShape(await this.typeShape(shape, key), key),
            ObjectType: async (type, key) => visitor.ObjectType(await this.objectType(type, key), key),
            DiscriminatedUnionVariant: async (variant, key) =>
                visitor.DiscriminatedUnionVariant(await this.objectType(variant, key), key),
            FormDataRequest: async (request, key) =>
                visitor.FormDataRequest(await this.formDataRequest(request, key), key),
            FormDataField: async (field, key) => visitor.FormDataField(await this.formDataField(field, key), key),
        };
        return innerVisitor;
    };

    endpoint = async (endpoint: Latest.EndpointDefinition, parentKey: string): Promise<Latest.EndpointDefinition> => {
        const pathParametersPromise = Promise.all(
            endpoint.pathParameters?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/path/${param.key}`),
            ) ?? [],
        );
        const queryParametersPromise = Promise.all(
            endpoint.queryParameters?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/query/${param.key}`),
            ) ?? [],
        );
        const requestHeadersPromise = Promise.all(
            endpoint.requestHeaders?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/requestHeader/${param.key}`),
            ) ?? [],
        );
        const responseHeadersPromise = Promise.all(
            endpoint.responseHeaders?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/responseHeader/${param.key}`),
            ) ?? [],
        );
        const requestPromise = endpoint.request
            ? this.visitor.HttpRequest(endpoint.request, `${parentKey}/request`)
            : undefined;
        const responsePromise = endpoint.response
            ? this.visitor.HttpResponse(endpoint.response, `${parentKey}/response`)
            : undefined;
        const errorsPromise = Promise.all(
            endpoint.errors?.map((error, i) =>
                this.visitor.ErrorResponse(error, `${parentKey}/error/${i}/${error.statusCode}`),
            ) ?? [],
        );
        const examplePromise = Promise.all(
            endpoint.examples?.map((example, i) =>
                this.visitor.ExampleEndpointCall(example, `${parentKey}/example/${i}`),
            ) ?? [],
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

    httpRequest = async (request: Latest.HttpRequest, parentKey: string): Promise<Latest.HttpRequest> => {
        const bodyPromise = visitDiscriminatedUnion(request.body)._visit<AsyncOrSync<Latest.HttpRequestBodyShape>>({
            object: async (value) => ({ ...value, ...(await this.visitor.ObjectType(value, `${parentKey}/object`)) }),
            alias: identity,
            bytes: identity,
            formData: async (value) => ({
                ...value,
                ...(await this.visitor.FormDataRequest(value, `${parentKey}/formdata`)),
            }),
        });
        return { ...request, body: await bodyPromise };
    };

    formDataField = async (field: Latest.FormDataField, parentKey: string): Promise<Latest.FormDataField> => {
        return visitDiscriminatedUnion(field)._visit<Promise<Latest.FormDataField>>({
            file: async (value) => ({
                ...value,
                ...(await this.visitor.FormDataFile(value, `${parentKey}/file/${value.key}`)),
            }),
            files: async (value) => ({
                ...value,
                ...(await this.visitor.FormDataFiles(value, `${parentKey}/files/${value.key}`)),
            }),
            property: async (value) => ({
                ...value,
                ...(await this.visitor.ObjectProperty(value, `${parentKey}/property/${value.key}`)),
            }),
        });
    };

    httpResponse = async (response: Latest.HttpResponse, parentKey: string): Promise<Latest.HttpResponse> => {
        const bodyPromise = visitDiscriminatedUnion(response.body)._visit<AsyncOrSync<Latest.HttpResponseBodyShape>>({
            object: async (value) => ({ ...value, ...(await this.visitor.ObjectType(value, `${parentKey}/object`)) }),
            alias: identity,
            fileDownload: identity,
            streamingText: identity,
            stream: async (value) => ({
                ...value,
                shape: await this.visitor.TypeShape(value.shape, `${parentKey}/stream/shape`),
            }),
        });
        return { ...response, body: await bodyPromise };
    };

    objectType = async <T extends Latest.ObjectType>(type: T, parentKey: string): Promise<T> => {
        const properties = await Promise.all(
            type.properties.map((prop) => this.visitor.ObjectProperty(prop, `${parentKey}/property/${prop.key}`)),
        );
        return { ...type, properties };
    };

    errorResponse = async (error: Latest.ErrorResponse, parentKey: string): Promise<Latest.ErrorResponse> => {
        const shapePromise = error.shape ? this.visitor.TypeShape(error.shape, `${parentKey}/error/shape`) : undefined;
        const examplesPromise = Promise.all(
            error.examples?.map((example, i) => this.visitor.ErrorExample(example, `${parentKey}/example/${i}`)) ?? [],
        );
        const [shape, examples] = await Promise.all([shapePromise, examplesPromise]);
        return { ...error, shape, examples: examples.length > 0 ? examples : undefined };
    };

    exampleEndpointCall = async (
        example: Latest.ExampleEndpointCall,
        parentKey: string,
    ): Promise<Latest.ExampleEndpointCall> => {
        const snippetsEntries = (
            await Promise.all(
                Object.entries(example.snippets ?? {}).map(
                    async ([language, snippets]) =>
                        [
                            language,
                            await Promise.all(
                                snippets.map((snippet, i) =>
                                    this.visitor.CodeSnippet(snippet, `${parentKey}/snippet/${language}/${i}`),
                                ),
                            ),
                        ] as const,
                ),
            )
        ).filter(([, snippets]) => snippets.length > 0);

        const snippets = Object.fromEntries(snippetsEntries);
        return {
            ...example,
            snippets: snippetsEntries.length > 0 ? snippets : undefined,
        };
    };

    webhookDefinition = async (
        webhook: Latest.WebhookDefinition,
        parentKey: string,
    ): Promise<Latest.WebhookDefinition> => {
        const payloadPromise =
            webhook.payload != null ? this.visitor.WebhookPayload(webhook.payload, `${parentKey}/payload`) : undefined;
        const headersPromise = Promise.all(
            webhook.headers?.map((header) =>
                this.visitor.ObjectProperty(header, `${parentKey}/header/${header.key}`),
            ) ?? [],
        );
        const [payload, headers] = await Promise.all([payloadPromise, headersPromise]);
        return {
            ...webhook,
            payload,
            headers: headers.length > 0 ? headers : undefined,
        };
    };

    webhookPayload = async (payload: Latest.WebhookPayload, parentKey: string): Promise<Latest.WebhookPayload> => {
        const bodyPromise = this.visitor.TypeShape(payload.shape, `${parentKey}/shape`);
        return { ...payload, shape: await bodyPromise };
    };

    webSocketChannel = async (
        channel: Latest.WebSocketChannel,
        parentKey: string,
    ): Promise<Latest.WebSocketChannel> => {
        const pathParametersPromise = Promise.all(
            channel.pathParameters?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/path/${param.key}`),
            ) ?? [],
        );
        const queryParametersPromise = Promise.all(
            channel.queryParameters?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/query/${param.key}`),
            ) ?? [],
        );
        const requestHeadersPromise = Promise.all(
            channel.requestHeaders?.map((param) =>
                this.visitor.ObjectProperty(param, `${parentKey}/requestHeader/${param.key}`),
            ) ?? [],
        );
        const messagesPromise = Promise.all(
            channel.messages.map((message) =>
                this.visitor.WebSocketMessage(message, `${parentKey}/message/${message.origin}/${message.type}`),
            ),
        );
        const examplesPromise = Promise.all(
            channel.examples?.map((example, i) =>
                this.visitor.ExampleWebSocketSession(example, `${parentKey}/example/${i}`),
            ) ?? [],
        );
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

    webSocketMessage = async (
        message: Latest.WebSocketMessage,
        parentKey: string,
    ): Promise<Latest.WebSocketMessage> => {
        const bodyPromise = this.visitor.TypeShape(message.body, `${parentKey}/body`);
        return {
            ...message,
            body: await bodyPromise,
        };
    };

    typeShape = async (shape: Latest.TypeShape, parentKey: string): Promise<Latest.TypeShape> => {
        return await visitDiscriminatedUnion(shape)._visit<AsyncOrSync<Latest.TypeShape>>({
            object: async (value) => ({
                ...value,
                ...(await this.visitor.ObjectType(value, `${parentKey}/object`)),
            }),
            alias: identity,
            enum: async (value) => ({
                ...value,
                values: await Promise.all(
                    value.values.map((enumValue) =>
                        this.visitor.EnumValue(enumValue, `${parentKey}/enum/value/${enumValue.value}`),
                    ),
                ),
            }),
            undiscriminatedUnion: async (value) => ({
                ...value,
                variants: await Promise.all(
                    value.variants.map((variant, i) =>
                        this.visitor.UndiscriminatedUnionVariant(
                            variant,
                            `${parentKey}/undiscriminatedUnion/variant/${i}`,
                        ),
                    ),
                ),
            }),
            discriminatedUnion: async (value) => ({
                ...value,
                variants: await Promise.all(
                    value.variants.map((variant) =>
                        this.visitor.DiscriminatedUnionVariant(
                            variant,
                            `${parentKey}/discriminatedUnion/variant/${variant.discriminantValue}`,
                        ),
                    ),
                ),
            }),
        });
    };

    formDataRequest = async (request: Latest.FormDataRequest, parentKey: string): Promise<Latest.FormDataRequest> => {
        return {
            ...request,
            fields: await Promise.all(
                request.fields.map((field) => this.visitor.FormDataField(field, `${parentKey}/field/${field.key}`)),
            ),
        };
    };

    typeDefinition = async (type: Latest.TypeDefinition, parentKey: string): Promise<Latest.TypeDefinition> => {
        return {
            ...type,
            shape: await this.visitor.TypeShape(type.shape, `${parentKey}/shape`),
        };
    };
}
