import { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact, mapValues } from "lodash-es";
import { captureSentryError } from "../analytics/sentry";
import { sortKeysByShape } from "../api-reference/examples/sortKeysByShape";
import type { FeatureFlags } from "../atoms";
import { MDX_SERIALIZER } from "../mdx/bundler";
import type { FernSerializeMdxOptions } from "../mdx/types";
import { ApiTypeResolver } from "./ApiTypeResolver";
import { resolveCodeSnippets } from "./resolveCodeSnippets";
import type {
    ResolvedEndpointDefinition,
    ResolvedEndpointPathParts,
    ResolvedError,
    ResolvedExampleEndpointRequest,
    ResolvedExampleEndpointResponse,
    ResolvedFormData,
    ResolvedFormDataRequestProperty,
    ResolvedFormValue,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedObjectProperty,
    ResolvedRequestBody,
    ResolvedResponseBody,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    ResolvedWebSocketChannel,
    ResolvedWebhookDefinition,
} from "./types";

interface MergedAuthAndHeaders {
    auth: APIV1Read.ApiAuth | undefined;
    headers: ResolvedObjectProperty[];
}

/**
 * @deprecated
 */
export class ApiEndpointResolver {
    public constructor(
        private collector: FernNavigation.NodeCollector,
        private holder: FernNavigation.ApiDefinitionHolder,
        private typeResolver: ApiTypeResolver,
        private resolvedTypes: Record<string, ResolvedTypeDefinition>,
        private featureFlags: FeatureFlags,
        private mdxOptions: FernSerializeMdxOptions | undefined,
        private serializeMdx: MDX_SERIALIZER,
    ) {}

    async resolveEndpointDefinition(node: FernNavigation.EndpointNode): Promise<ResolvedEndpointDefinition> {
        const endpoint = this.holder.endpoints.get(node.endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint with ID ${node.endpointId} not found`);
        }
        const pathParametersPromise = await Promise.all(
            endpoint.path.pathParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(parameter.type),
                    this.serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(parameter.key),
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
                    this.typeResolver.resolveTypeReference(parameter.type),
                    this.serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(parameter.key),
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
                    this.typeResolver.resolveTypeReference(header.type),
                    this.serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(header.key),
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: false,
                };
            }),
            ...(this.holder.api.globalHeaders ?? []).map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    this.serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(header.key),
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: true,
                };
            }),
        ]);

        const errorsPromise = Promise.all(
            (endpoint.errorsV2 ?? []).map(async (error): Promise<ResolvedError> => {
                const [shape, description] = await Promise.all([
                    error.type != null
                        ? this.typeResolver.resolveTypeShape({
                              typeShape: error.type,
                              id: `${endpoint.id}-${error.statusCode}-${error.name}`,
                              name: error.name,
                          })
                        : ({ type: "unknown" } as ResolvedTypeDefinition),
                    this.serializeMdx(error.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    statusCode: error.statusCode,
                    name: error.name,
                    shape,
                    description,
                    availability: error.availability,
                    examples:
                        error.examples?.map((example) => ({
                            name: example.name,
                            description: example.description,
                            responseBody: example.responseBody.value,
                        })) ?? [],
                };
            }),
        );

        const descriptionPromise = this.serializeMdx(endpoint.description, {
            files: this.mdxOptions?.files,
        });

        const [pathParameters, queryParameters, rawHeaders, errors, description, requestBody, responseBody] =
            await Promise.all([
                pathParametersPromise,
                queryParametersPromise,
                headersPromise,
                errorsPromise,
                descriptionPromise,
                endpoint.request != null ? this.resolveRequestBody(endpoint.request) : undefined,
                endpoint.response != null ? this.resolveResponseBody(endpoint.response) : undefined,
            ]);

        const path = endpoint.path.parts.map((pathPart): ResolvedEndpointPathParts => {
            if (pathPart.type === "literal") {
                return pathPart;
            } else {
                const parameter = pathParameters.find((parameter) => String(parameter.key) === String(pathPart.value));
                if (parameter == null) {
                    return {
                        type: "pathParameter",
                        key: APIV1Read.PropertyKey(pathPart.value),
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

        const { auth, headers } = this.mergeAuthAndHeaders(endpoint.authed, this.holder.api.auth, rawHeaders);

        const toRet: ResolvedEndpointDefinition = {
            type: "endpoint",
            nodeId: node.id,
            breadcrumb: FernNavigation.utils.createBreadcrumbs(this.collector.getParents(node.id)),
            id: node.endpointId,
            slug: node.slug,
            description,
            auth,
            availability: endpoint.availability,
            apiDefinitionId: node.apiDefinitionId,
            environments: endpoint.environments,
            method: endpoint.method,
            examples: [],
            title: node.title,
            defaultEnvironment: endpoint.environments.find((env) => env.id === endpoint.defaultEnvironment),
            path,
            pathParameters,
            queryParameters,
            headers,
            requestBody,
            responseBody,
            errors,
            snippetTemplates: endpoint.snippetTemplates,
            stream: undefined,
        };

        toRet.examples = await Promise.all(
            endpoint.examples.map(async (example) => {
                const requestBody = this.resolveExampleEndpointRequest(example.requestBodyV3, toRet.requestBody?.shape);
                const responseBody = this.resolveExampleEndpointResponse(
                    example.responseBodyV3,
                    toRet.responseBody?.shape,
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
                    snippets: await resolveCodeSnippets(
                        toRet,
                        example,
                        requestBody,
                        this.featureFlags.isHttpSnippetsEnabled,
                        this.featureFlags.useJavaScriptAsTypeScript,
                        this.featureFlags.alwaysEnableJavaScriptFetch,
                    ),
                };
            }),
        );

        return toRet;
    }

    async resolveRequestBody(request: APIV1Read.HttpRequest): Promise<ResolvedRequestBody> {
        const [shape, description] = await Promise.all([
            this.resolveRequestBodyShape(request.type),
            this.serializeMdx(request.description, {
                files: this.mdxOptions?.files,
            }),
        ]);
        return {
            contentType: request.contentType,
            shape,
            description,
            availability: undefined,
        };
    }

    async resolveResponseBody(response: APIV1Read.HttpResponse): Promise<ResolvedResponseBody> {
        const [shape, description] = await Promise.all([
            this.resolveResponseBodyShape(response.type),
            this.serializeMdx(response.description, {
                files: this.mdxOptions?.files,
            }),
        ]);
        return { shape, description, statusCode: response?.statusCode ?? 200, availability: undefined };
    }

    // HACKHACK: this handles the case where FernIR is unable to interpret the security scheme for AsyncAPI
    // and that we direct users to specify the websocket bindings instead.
    mergeAuthAndHeaders(
        authed: boolean,
        auth: APIV1Read.ApiAuth | undefined,
        headers: ResolvedObjectProperty[],
    ): MergedAuthAndHeaders {
        if (authed && auth != null) {
            return { auth, headers };
        }

        for (const header of headers) {
            if (
                APIV1Read.PropertyKey(header.key).toLowerCase() === "authorization" ||
                APIV1Read.PropertyKey(header.key).toLowerCase().includes("api-key") ||
                APIV1Read.PropertyKey(header.key).toLowerCase().includes("apikey")
            ) {
                const auth: APIV1Read.ApiAuth = {
                    type: "header",
                    headerWireValue: APIV1Read.PropertyKey(header.key),
                    nameOverride: undefined,
                    prefix: undefined,
                };
                return { auth, headers: headers.filter((h) => h.key !== APIV1Read.PropertyKey(header.key)) };
            }
        }

        return { auth: undefined, headers };
    }

    async resolveWebsocketChannel(node: FernNavigation.WebSocketNode): Promise<ResolvedWebSocketChannel> {
        const channel = this.holder.webSockets.get(node.webSocketId);
        if (channel == null) {
            throw new Error(`WebSocket channel with ID ${node.webSocketId} not found`);
        }
        const pathParametersPromise = Promise.all(
            channel.path.pathParameters.map(
                async (parameter): Promise<ResolvedObjectProperty> => ({
                    key: APIV1Read.PropertyKey(parameter.key),
                    valueShape: await this.typeResolver.resolveTypeReference(parameter.type),
                    description: await this.serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
                    availability: parameter.availability,
                    hidden: false,
                }),
            ),
        );
        const headersPromise = Promise.all([
            ...channel.headers.map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    this.serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(header.key),
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: false,
                };
            }),
            ...(this.holder.api.globalHeaders ?? []).map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    this.serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(header.key),
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: true,
                };
            }),
        ]);
        const queryParametersPromise = Promise.all(
            channel.queryParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(parameter.type),
                    this.serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: APIV1Read.PropertyKey(parameter.key),
                    valueShape,
                    description,
                    availability: parameter.availability,
                    hidden: false,
                };
            }),
        );
        const messagesPromise = Promise.all(
            channel.messages.map(async ({ type, body, origin, displayName, description, availability }) => {
                const [resolvedBody, resolvedDescription] = await Promise.all([
                    this.resolvePayloadShape(body),
                    this.serializeMdx(description, {
                        files: this.mdxOptions?.files,
                    }),
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

        const descriptionPromise = this.serializeMdx(channel.description, {
            files: this.mdxOptions?.files,
        });

        const [pathParameters, rawHeaders, queryParameters, messages, description] = await Promise.all([
            pathParametersPromise,
            headersPromise,
            queryParametersPromise,
            messagesPromise,
            descriptionPromise,
        ]);

        // HACKHACK: force auth=true forces auth to always be included since websocket security schemes is borked in FernIR -> FDR
        const { auth, headers } = this.mergeAuthAndHeaders(true, this.holder.api.auth, rawHeaders);

        return {
            type: "websocket",
            nodeId: node.id,
            breadcrumb: FernNavigation.utils.createBreadcrumbs(this.collector.getParents(node.id)),
            auth,
            environments: channel.environments,
            id: node.webSocketId,
            apiDefinitionId: node.apiDefinitionId,
            description,
            availability: channel.availability,
            slug: node.slug,
            title: node.title,
            path: channel.path.parts
                .map((pathPart): ResolvedEndpointPathParts | undefined => {
                    if (pathPart.type === "literal") {
                        return { ...pathPart };
                    } else {
                        const correspondingParameter = pathParameters.find(
                            (param) => String(param.key) === String(pathPart.value),
                        );
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
            examples: channel.examples,
            defaultEnvironment: channel.environments.find((env) => env.id === channel.defaultEnvironment),
        };
    }

    async resolveWebhookDefinition(node: FernNavigation.WebhookNode): Promise<ResolvedWebhookDefinition> {
        const webhook = this.holder.webhooks.get(node.webhookId);
        if (webhook == null) {
            throw new Error(`Webhook with ID ${node.webhookId} not found`);
        }
        const [payloadShape, description, headers] = await Promise.all([
            this.resolvePayloadShape(webhook.payload.type),
            await this.serializeMdx(webhook.description, {
                files: this.mdxOptions?.files,
            }),
            Promise.all(
                webhook.headers.map(
                    async (header): Promise<ResolvedObjectProperty> => ({
                        key: APIV1Read.PropertyKey(header.key),
                        valueShape: await this.typeResolver.resolveTypeReference(header.type),
                        description: await this.serializeMdx(header.description, {
                            files: this.mdxOptions?.files,
                        }),
                        availability: header.availability,
                        hidden: false,
                    }),
                ),
            ),
        ]);
        return {
            type: "webhook",
            nodeId: node.id,
            breadcrumb: FernNavigation.utils.createBreadcrumbs(this.collector.getParents(node.id)),
            title: node.title,
            description,
            availability: undefined,
            slug: node.slug,
            method: webhook.method,
            apiDefinitionId: node.apiDefinitionId,
            id: node.webhookId,
            path: webhook.path,
            headers,
            payload: {
                shape: payloadShape,
                description: await this.serializeMdx(webhook.payload.description, {
                    files: this.mdxOptions?.files,
                }),
                availability: undefined,
            },
            examples: webhook.examples.map((example) => {
                const sortedPayload = this.safeSortKeysByShape(example.payload, payloadShape);
                return { payload: sortedPayload };
            }),
        };
    }

    resolvePayloadShape(
        payloadShape: APIV1Read.WebhookPayloadShape | APIV1Read.WebSocketMessageBodyShape,
    ): Promise<ResolvedTypeShape> {
        return visitDiscriminatedUnion(payloadShape, "type")._visit<Promise<ResolvedTypeShape>>({
            object: async (object) => ({
                type: "object",
                name: undefined,
                extends: object.extends,
                properties: await this.typeResolver.resolveObjectProperties(object),
                description: undefined,
                availability: undefined,
            }),
            reference: (reference) => this.typeResolver.resolveTypeReference(reference.value),
            _other: () =>
                Promise.resolve({
                    type: "unknown",
                    availability: undefined,
                    description: undefined,
                }),
        });
    }

    resolveRequestBodyShape(requestBodyShape: APIV1Read.HttpRequestBodyShape): Promise<ResolvedHttpRequestBodyShape> {
        return visitDiscriminatedUnion(requestBodyShape, "type")._visit<Promise<ResolvedHttpRequestBodyShape>>({
            object: async (object) => ({
                type: "object",
                name: undefined,
                extends: object.extends,
                properties: await this.typeResolver.resolveObjectProperties(object),
                description: undefined,
                availability: undefined,
            }),
            formData: this.resolveFormData,
            fileUpload: (fileUpload) =>
                fileUpload.value != null
                    ? this.resolveFormData(fileUpload.value)
                    : Promise.resolve({
                          type: "formData",
                          name: "Form Data",
                          properties: [],
                          description: undefined,
                          availability: undefined,
                      }),
            bytes: (bytes) => Promise.resolve(bytes),
            reference: (reference) => this.typeResolver.resolveTypeReference(reference.value),
            _other: () =>
                Promise.resolve({
                    type: "unknown",
                    availability: undefined,
                    description: undefined,
                }),
        });
    }

    async resolveFormData(formData: APIV1Read.FormDataRequest): Promise<ResolvedFormData> {
        return {
            type: "formData",
            description: await this.serializeMdx(formData.description, {
                files: this.mdxOptions?.files,
            }),
            availability: formData.availability,
            name: formData.name,
            properties: await Promise.all(
                formData.properties.map(async (property): Promise<ResolvedFormDataRequestProperty> => {
                    switch (property.type) {
                        case "file": {
                            const description = await this.serializeMdx(property.value.description, {
                                files: this.mdxOptions?.files,
                            });
                            return {
                                type: property.value.type,
                                key: property.value.key,
                                description,
                                availability: property.value.availability,
                                isOptional: property.value.isOptional,
                                contentType: property.value.contentType,
                            };
                        }
                        case "bodyProperty": {
                            const [description, valueShape] = await Promise.all([
                                this.serializeMdx(property.description, {
                                    files: this.mdxOptions?.files,
                                }),
                                this.typeResolver.resolveTypeReference(property.valueType),
                            ]);
                            return {
                                type: "bodyProperty",
                                key: property.key,
                                description,
                                availability: property.availability,
                                valueShape,
                                hidden: false,
                                contentType: property.contentType,
                            };
                        }
                    }
                }),
            ),
        };
    }

    resolveResponseBodyShape(
        responseBodyShape: APIV1Read.HttpResponseBodyShape,
    ): Promise<ResolvedHttpResponseBodyShape> {
        return Promise.resolve(
            visitDiscriminatedUnion(responseBodyShape, "type")._visit<
                ResolvedHttpResponseBodyShape | Promise<ResolvedHttpResponseBodyShape>
            >({
                object: async (object) => ({
                    type: "object",
                    name: undefined,
                    extends: object.extends,
                    properties: await this.typeResolver.resolveObjectProperties(object),
                    description: undefined,
                    availability: undefined,
                }),
                fileDownload: (fileDownload) => fileDownload,
                streamingText: (streamingText) => streamingText,
                streamCondition: (streamCondition) => streamCondition,
                reference: (reference) => this.typeResolver.resolveTypeReference(reference.value),
                stream: async (stream) => {
                    if (stream.shape.type === "reference") {
                        return {
                            type: "stream",
                            value: await this.typeResolver.resolveTypeReference(stream.shape.value),
                        };
                    }
                    return {
                        type: "stream",
                        value: {
                            type: "object",
                            name: undefined,
                            extends: stream.shape.extends,
                            properties: await this.typeResolver.resolveObjectProperties(stream.shape),
                            description: undefined,
                            availability: undefined,
                        },
                    };
                },
                _other: () => ({ type: "unknown", availability: undefined, description: undefined }),
            }),
        );
    }

    resolveExampleEndpointRequest(
        requestBodyV3: APIV1Read.ExampleEndpointRequest | undefined,
        shape: ResolvedHttpRequestBodyShape | undefined,
    ): ResolvedExampleEndpointRequest | undefined {
        if (requestBodyV3 == null) {
            return undefined;
        }
        return visitDiscriminatedUnion(requestBodyV3, "type")._visit<ResolvedExampleEndpointRequest | undefined>({
            json: (json) => ({
                type: "json",
                value: this.safeSortKeysByShape(json.value, shape),
            }),
            form: (form) => ({
                type: "form",
                value: mapValues(form.value, (v, key) =>
                    visitDiscriminatedUnion(v, "type")._visit<ResolvedFormValue>({
                        json: (value) => {
                            const property =
                                shape?.type === "formData"
                                    ? shape.properties.find((p) => p.key === key && p.type === "bodyProperty")
                                    : undefined;
                            // this is a hack to allow the API Playground to send JSON blobs in form data
                            // revert this once we have a better solution
                            const contentType =
                                compact(property?.contentType)[0] ??
                                (this.featureFlags.usesApplicationJsonInFormDataValue ? "application/json" : undefined);
                            return { type: "json" as const, value: value.value, contentType };
                        },
                        filename: (value) => ({
                            type: "file",
                            fileName: value.value,
                            fileId: undefined,
                            contentType: undefined,
                        }),
                        filenames: (value) => ({
                            type: "fileArray",
                            files: value.value.map((v) => ({
                                type: "file",
                                fileName: v,
                                fileId: undefined,
                                contentType: undefined,
                            })),
                        }),
                        filenameWithData: (value) => ({
                            type: "file",
                            fileName: value.filename,
                            fileId: value.data,
                            contentType: undefined,
                        }),
                        filenamesWithData: (value) => ({
                            type: "fileArray",
                            files: value.value.map((v) => ({
                                type: "file",
                                fileName: v.filename,
                                fileId: v.data,
                                contentType: undefined,
                            })),
                        }),
                        _other: () => ({ type: "json", value: undefined, contentType: undefined }),
                    }),
                ),
            }),
            bytes: (bytes) => ({ type: "bytes", value: bytes.value.value, fileName: undefined }),
            _other: () => undefined,
        });
    }

    resolveExampleEndpointResponse(
        responseBodyV3: APIV1Read.ExampleEndpointResponse | undefined,
        shape: ResolvedHttpResponseBodyShape | undefined,
    ): ResolvedExampleEndpointResponse | undefined {
        if (responseBodyV3 == null) {
            return undefined;
        }
        return visitDiscriminatedUnion(responseBodyV3, "type")._visit<ResolvedExampleEndpointResponse | undefined>({
            json: (json) => ({
                type: "json",
                value: json.value != null ? this.safeSortKeysByShape(json.value, shape) : undefined,
            }),
            filename: (filename) => ({ type: "filename", value: filename.value }),
            stream: (stream) => ({
                type: "stream",
                value: stream.value.map((streamValue) => this.safeSortKeysByShape(streamValue, shape)),
            }),
            sse: (sse) => ({
                type: "sse",
                value: sse.value.map((sse) => ({
                    event: sse.event,
                    data: this.safeSortKeysByShape(sse.data, shape),
                })),
            }),
            _other: () => undefined,
        });
    }

    safeSortKeysByShape(
        value: unknown,
        shape: ResolvedTypeShape | ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape | null | undefined,
    ): unknown {
        if (value == null) {
            return value;
        }
        try {
            return this.stripUndefines(sortKeysByShape(value, shape, this.resolvedTypes));
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to sort JSON keys by type shape", e);

            captureSentryError(e, {
                context: "ApiPage",
                errorSource: "sortKeysByShape",
                errorDescription:
                    "Failed to sort and strip undefines from JSON value, indicating a bug in the resolver. This error should be investigated.",
            });

            return value;
        }
    }

    stripUndefines(obj: unknown): unknown {
        return JSON.parse(JSON.stringify(obj));
    }
}
