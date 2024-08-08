import type { APIV1Read, DocsV1Read, FernNavigation } from "@fern-api/fdr-sdk";
import { isNonNullish, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { compact, mapValues } from "lodash-es";
import { captureSentryError, captureSentryErrorMessage } from "../analytics/sentry";
import { sortKeysByShape } from "../api-page/examples/sortKeysByShape";
import { FeatureFlags } from "../atoms";
import { serializeMdx } from "../mdx/bundler";
import { FernSerializeMdxOptions } from "../mdx/types";
import { ApiTypeResolver } from "./ApiTypeResolver";
import { resolveCodeSnippets } from "./resolveCodeSnippets";
import {
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
    ResolvedPackageItem,
    ResolvedRequestBody,
    ResolvedResponseBody,
    ResolvedRootPackage,
    ResolvedSubpackage,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    ResolvedWebSocketChannel,
    ResolvedWebhookDefinition,
    ResolvedWithApiDefinition,
} from "./types";

interface MergedAuthAndHeaders {
    auth: APIV1Read.ApiAuth | undefined;
    headers: ResolvedObjectProperty[];
}

export class ApiDefinitionResolver {
    public static async resolve(
        root: FernNavigation.ApiReferenceNode,
        holder: FernNavigation.ApiDefinitionHolder,
        typeResolver: ApiTypeResolver,
        pages: Record<string, DocsV1Read.PageContent>,
        mdxOptions: FernSerializeMdxOptions | undefined,
        featureFlags: FeatureFlags,
        domain: string,
    ): Promise<ResolvedRootPackage> {
        const resolver = new ApiDefinitionResolver(root, holder, typeResolver, pages, featureFlags, domain, mdxOptions);
        return resolver.resolveApiDefinition();
    }

    private resolvedTypes: Record<string, ResolvedTypeDefinition> = {};

    private constructor(
        private root: FernNavigation.ApiReferenceNode,
        private holder: FernNavigation.ApiDefinitionHolder,
        private typeResolver: ApiTypeResolver,
        private pages: Record<string, DocsV1Read.PageContent>,
        private featureFlags: FeatureFlags,
        private domain: string,
        private mdxOptions: FernSerializeMdxOptions | undefined,
    ) {}

    private async resolveApiDefinition(): Promise<ResolvedRootPackage> {
        this.resolvedTypes = await this.typeResolver.resolve();

        const withPackage = await this.resolveApiDefinitionPackage(this.root);

        return {
            type: "rootPackage",
            ...withPackage,
            api: this.root.apiDefinitionId,
            auth: this.holder.api.auth,
            types: this.resolvedTypes,
        };
    }

    async resolveApiDefinitionPackage(
        node: FernNavigation.ApiReferenceNode | FernNavigation.ApiPackageNode,
    ): Promise<ResolvedWithApiDefinition> {
        const maybeItems = await Promise.all(
            node.children.map((item) =>
                visitDiscriminatedUnion(item)._visit<Promise<ResolvedPackageItem | undefined>>({
                    endpoint: (endpoint) => this.resolveEndpointDefinition(endpoint),
                    endpointPair: async (endpointPair) => {
                        if (this.featureFlags.isBatchStreamToggleDisabled) {
                            captureSentryErrorMessage(
                                "Batch stream toggle is disabled, but an endpoint pair was found",
                            );
                        }
                        const [nonStream, stream] = await Promise.all([
                            this.resolveEndpointDefinition(endpointPair.nonStream),
                            this.resolveEndpointDefinition(endpointPair.stream),
                        ]);
                        nonStream.stream = stream;
                        return nonStream;
                    },
                    link: async () => undefined,
                    webSocket: (websocket) => this.resolveWebsocketChannel(websocket),
                    webhook: (webhook) => this.resolveWebhookDefinition(webhook),
                    apiPackage: (section) => this.resolveSubpackage(section),
                    page: async (page) => {
                        const pageContent = this.pages[page.pageId];
                        if (pageContent == null) {
                            return undefined;
                        }
                        return {
                            type: "page",
                            id: page.pageId,
                            slug: page.slug,
                            title: page.title,
                            markdown: await serializeMdx(pageContent.markdown, {
                                ...this.mdxOptions,
                                filename: page.pageId,
                                frontmatterDefaults: {
                                    title: page.title,
                                    breadcrumbs: [], // TODO: implement breadcrumbs
                                    "edit-this-page-url": pageContent.editThisPageUrl,
                                    "hide-nav-links": true,
                                    layout: "reference",
                                    "force-toc": this.featureFlags.isTocDefaultEnabled,
                                },
                            }),
                        };
                    },
                }),
            ),
        );

        const items = maybeItems.filter(isNonNullish);

        if (node.overviewPageId != null && this.pages[node.overviewPageId] != null) {
            const pageContent = this.pages[node.overviewPageId];
            if (pageContent != null) {
                items.unshift({
                    type: "page",
                    id: node.overviewPageId,
                    slug: node.slug,
                    title: node.title,
                    markdown: await serializeMdx(pageContent.markdown, {
                        ...this.mdxOptions,
                        filename: node.overviewPageId,
                        frontmatterDefaults: {
                            title: node.title,
                            breadcrumbs: [], // TODO: implement breadcrumbs
                            "edit-this-page-url": pageContent.editThisPageUrl,
                            "hide-nav-links": true,
                            layout: "reference",
                            "force-toc": this.featureFlags.isTocDefaultEnabled,
                        },
                    }),
                });
            } else {
                // TODO: alert if the page is null
            }
        }

        return {
            items,
            slug: node.slug,
        };
    }

    async resolveSubpackage(subpackage: FernNavigation.ApiPackageNode): Promise<ResolvedSubpackage | undefined> {
        const { items } = await this.resolveApiDefinitionPackage(subpackage);

        if (subpackage == null || items.length === 0) {
            return undefined;
        }
        return {
            // description: await serializeMdx(subpackage.description),
            description: undefined,
            availability: undefined,
            title: subpackage.title,
            type: "subpackage",
            slug: subpackage.slug,
            items,
        };
    }

    async resolveEndpointDefinition(node: FernNavigation.EndpointNode): Promise<ResolvedEndpointDefinition> {
        const endpoint = this.holder.endpoints.get(node.endpointId);
        if (endpoint == null) {
            throw new Error(`Endpoint with ID ${node.endpointId} not found`);
        }
        const pathParametersPromise = await Promise.all(
            endpoint.path.pathParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(parameter.type),
                    serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
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
                    this.typeResolver.resolveTypeReference(parameter.type),
                    serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
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
                    this.typeResolver.resolveTypeReference(header.type),
                    serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: header.key,
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: false,
                };
            }),
            ...(this.holder.api.globalHeaders ?? []).map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
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
            (endpoint.errorsV2 ?? []).map(async (error): Promise<ResolvedError> => {
                const [shape, description] = await Promise.all([
                    error.type != null
                        ? this.typeResolver.resolveTypeShape(undefined, error.type, undefined, undefined)
                        : ({ type: "unknown" } as ResolvedTypeDefinition),
                    serializeMdx(error.description, {
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

        const descriptionPromise = serializeMdx(endpoint.description, {
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

        const { auth, headers } = this.mergeAuthAndHeaders(endpoint.authed, this.holder.api.auth, rawHeaders);

        const toRet: ResolvedEndpointDefinition = {
            type: "endpoint",
            nodeId: node.id,
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
            serializeMdx(request.description, {
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
            serializeMdx(response.description, {
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
                header.key.toLowerCase() === "authorization" ||
                header.key.toLowerCase().includes("api-key") ||
                header.key.toLowerCase().includes("apikey")
            ) {
                const auth: APIV1Read.ApiAuth = {
                    type: "header",
                    headerWireValue: header.key,
                };
                return { auth, headers: headers.filter((h) => h.key !== header.key) };
            }
        }

        return { auth: undefined, headers };
    }

    async resolveWebsocketChannel(node: FernNavigation.WebSocketNode): Promise<ResolvedWebSocketChannel> {
        const websocket = this.holder.webSockets.get(node.webSocketId);
        if (websocket == null) {
            throw new Error(`Websocket with ID ${node.webSocketId} not found`);
        }
        const pathParametersPromise = Promise.all(
            websocket.path.pathParameters.map(
                async (parameter): Promise<ResolvedObjectProperty> => ({
                    key: parameter.key,
                    valueShape: await this.typeResolver.resolveTypeReference(parameter.type),
                    description: await serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
                    availability: parameter.availability,
                    hidden: false,
                }),
            ),
        );
        const headersPromise = Promise.all([
            ...websocket.headers.map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
                ]);
                return {
                    key: header.key,
                    valueShape,
                    description,
                    availability: header.availability,
                    hidden: false,
                };
            }),
            ...(this.holder.api.globalHeaders ?? []).map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.typeResolver.resolveTypeReference(header.type),
                    serializeMdx(header.description, {
                        files: this.mdxOptions?.files,
                    }),
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
                    this.typeResolver.resolveTypeReference(parameter.type),
                    serializeMdx(parameter.description, {
                        files: this.mdxOptions?.files,
                    }),
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
                    this.resolvePayloadShape(body),
                    serializeMdx(description, {
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
        const [pathParameters, rawHeaders, queryParameters, messages] = await Promise.all([
            pathParametersPromise,
            headersPromise,
            queryParametersPromise,
            messagesPromise,
        ]);

        // HACKHACK: force auth=true forces auth to always be included since websocket security schemes is borked in FernIR -> FDR
        const { auth, headers } = this.mergeAuthAndHeaders(true, this.holder.api.auth, rawHeaders);

        return {
            type: "websocket",
            auth,
            environments: websocket.environments,
            nodeId: node.id,
            id: node.webSocketId,
            description: websocket.description,
            availability: websocket.availability,
            slug: node.slug,
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
            defaultEnvironment: websocket.environments.find((env) => env.id === websocket.defaultEnvironment),
        };
    }

    async resolveWebhookDefinition(node: FernNavigation.WebhookNode): Promise<ResolvedWebhookDefinition> {
        const webhook = this.holder.webhooks.get(node.webhookId);
        if (webhook == null) {
            throw new Error(`Webhook with ID ${node.webhookId} not found`);
        }

        const [payloadShape, description, headers] = await Promise.all([
            this.resolvePayloadShape(webhook.payload.type),
            await serializeMdx(webhook.description, {
                files: this.mdxOptions?.files,
            }),
            Promise.all(
                webhook.headers.map(
                    async (header): Promise<ResolvedObjectProperty> => ({
                        key: header.key,
                        valueShape: await this.typeResolver.resolveTypeReference(header.type),
                        description: await serializeMdx(header.description, {
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
            name: webhook.name,
            description,
            availability: undefined,
            slug: node.slug,
            method: webhook.method,
            nodeId: node.id,
            id: node.webhookId,
            path: webhook.path,
            headers,
            payload: {
                shape: payloadShape,
                description: await serializeMdx(webhook.payload.description, {
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
            description: await serializeMdx(formData.description, {
                files: this.mdxOptions?.files,
            }),
            availability: formData.availability,
            name: formData.name,
            properties: await Promise.all(
                formData.properties.map(async (property): Promise<ResolvedFormDataRequestProperty> => {
                    switch (property.type) {
                        case "file": {
                            const description = await serializeMdx(property.value.description, {
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
                                serializeMdx(property.description, {
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
                                (this.domain.includes("fileforge") ? "application/json" : undefined);
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
}
