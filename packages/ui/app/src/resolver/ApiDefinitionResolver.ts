import { APIV1Read, DocsV1Read, FdrAPI } from "@fern-api/fdr-sdk";
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
import { mapValues } from "lodash-es";
import { captureSentryError } from "../analytics/sentry";
import { sortKeysByShape } from "../api-page/examples/sortKeysByShape";
import { FeatureFlags } from "../contexts/FeatureFlagContext";
import { FernSerializeMdxOptions, maybeSerializeMdxContent, serializeMdxWithFrontmatter } from "../mdx/mdx";
import { ApiTypeResolver } from "./ApiTypeResolver";
import { resolveCodeSnippets } from "./resolveCodeSnippets";
import {
    ResolvedEndpointDefinition,
    ResolvedEndpointPathParts,
    ResolvedError,
    ResolvedExampleEndpointRequest,
    ResolvedExampleEndpointResponse,
    ResolvedFileUploadRequestProperty,
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
    stringifyResolvedEndpointPathParts,
} from "./types";

interface MergedAuthAndHeaders {
    auth: APIV1Read.ApiAuth | undefined;
    headers: ResolvedObjectProperty[];
}

export class ApiDefinitionResolver {
    public static async resolve(
        title: string,
        apiDefinition: FlattenedApiDefinition,
        pages: Record<string, DocsV1Read.PageContent>,
        mdxOptions: FernSerializeMdxOptions | undefined,
        featureFlags: FeatureFlags,
    ): Promise<ResolvedRootPackage> {
        const resolver = new ApiDefinitionResolver(apiDefinition, pages, featureFlags);
        return resolver.resolveApiDefinition(title, mdxOptions);
    }

    private apiTypeResolver;
    private resolvedTypes: Record<string, ResolvedTypeDefinition> = {};

    private constructor(
        private apiDefinition: FlattenedApiDefinition,
        private pages: Record<string, DocsV1Read.PageContent>,
        private featureFlags: FeatureFlags,
        // filteredTypes?: string[],
    ) {
        this.apiDefinition = apiDefinition;
        this.pages = pages;
        this.apiTypeResolver = new ApiTypeResolver(apiDefinition.types);
    }

    private async resolveApiDefinition(
        title: string,
        mdxOptions: FernSerializeMdxOptions | undefined,
        // filteredTypes?: string[],
    ): Promise<ResolvedRootPackage> {
        // const highlighter = await getHighlighterInstance();

        // const resolvedTypes = Object.fromEntries(
        //     await Promise.all(
        //         Object.entries(filteredTypes != null ? pick(apiDefinition.types, filteredTypes) : apiDefinition.types).map(
        //             async ([key, value]) => [key, await resolveTypeDefinition(value, apiDefinition.types)],
        //         ),
        //     ),
        // );
        this.resolvedTypes = await this.apiTypeResolver.resolve();

        const withPackage = await this.resolveApiDefinitionPackage(
            title,
            this.apiDefinition.api,
            this.apiDefinition,
            mdxOptions,
        );
        return {
            type: "rootPackage",
            ...withPackage,
            api: this.apiDefinition.api,
            auth: this.apiDefinition.auth,
            types: this.resolvedTypes,
        };
    }

    async resolveApiDefinitionPackage(
        title: string,
        id: APIV1Read.SubpackageId,
        package_: FlattenedApiDefinitionPackage | undefined,
        mdxOptions: FernSerializeMdxOptions | undefined,
    ): Promise<ResolvedWithApiDefinition> {
        if (package_ == null) {
            return { items: [], slug: [] };
        }

        const maybeItems = await Promise.all(
            package_.items.map((item) =>
                FlattenedApiDefinitionPackageItem.visit<Promise<ResolvedPackageItem | undefined>>(item, {
                    endpoint: (endpoint) => this.resolveEndpointDefinition(id, endpoint),
                    websocket: (websocket) => this.resolveWebsocketChannel(websocket),
                    webhook: (webhook) => this.resolveWebhookDefinition(webhook),
                    subpackage: (subpackage) => this.resolveSubpackage(subpackage, mdxOptions),
                    page: async (page) => {
                        const pageContent = this.pages[page.id];
                        if (pageContent == null) {
                            return undefined;
                        }
                        return {
                            type: "page",
                            id: page.id,
                            slug: item.slug,
                            title: page.title,
                            markdown: await serializeMdxWithFrontmatter(pageContent.markdown, {
                                ...mdxOptions,
                                pageHeader: {
                                    title: page.title,
                                    breadcrumbs: [], // TODO: implement breadcrumbs
                                    editThisPageUrl: pageContent.editThisPageUrl,
                                    hideNavLinks: true,
                                    layout: "reference",
                                    isTocDefaultEnabled: this.featureFlags.isTocDefaultEnabled,
                                },
                            }),
                        };
                    },
                }),
            ),
        );

        const items = maybeItems.filter(isNonNullish);

        if (package_.summaryPageId != null && this.pages[package_.summaryPageId] != null) {
            const pageContent = this.pages[package_.summaryPageId];
            items.unshift({
                type: "page",
                id: package_.summaryPageId,
                slug: package_.slug,
                title,
                markdown: await serializeMdxWithFrontmatter(pageContent.markdown, {
                    ...mdxOptions,
                    pageHeader: {
                        title,
                        breadcrumbs: [], // TODO: implement breadcrumbs
                        editThisPageUrl: pageContent.editThisPageUrl,
                        hideNavLinks: true,
                        layout: "reference",
                        isTocDefaultEnabled: this.featureFlags.isTocDefaultEnabled,
                    },
                }),
            });
        }

        return {
            items,
            slug: package_.slug,
        };
    }

    async resolveSubpackage(
        subpackage: FlattenedSubpackage,
        mdxOptions: FernSerializeMdxOptions | undefined,
    ): Promise<ResolvedSubpackage | undefined> {
        const { items } = await this.resolveApiDefinitionPackage(
            subpackage.name,
            subpackage.subpackageId,
            subpackage,
            mdxOptions,
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
            apiSectionId: this.apiDefinition.api,
            id: subpackage.subpackageId,
            slug: subpackage.slug,
            items,
        };
    }

    async resolveEndpointDefinition(
        apiPackageId: FdrAPI.ApiDefinitionId,
        endpoint: FlattenedEndpointDefinition,
    ): Promise<ResolvedEndpointDefinition> {
        const pathParametersPromise = await Promise.all(
            endpoint.path.pathParameters.map(async (parameter): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.apiTypeResolver.resolveTypeReference(parameter.type),
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
                    this.apiTypeResolver.resolveTypeReference(parameter.type),
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
                    this.apiTypeResolver.resolveTypeReference(header.type),
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
            ...this.apiDefinition.globalHeaders.map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.apiTypeResolver.resolveTypeReference(header.type),
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
                        ? this.apiTypeResolver.resolveTypeShape(undefined, error.type, undefined, undefined)
                        : ({ type: "unknown" } as ResolvedTypeDefinition),
                    maybeSerializeMdxContent(error.description),
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

        const descriptionPromise = maybeSerializeMdxContent(endpoint.description);

        const [pathParameters, queryParameters, rawHeaders, errors, description, requestBody, responseBody] =
            await Promise.all([
                pathParametersPromise,
                queryParametersPromise,
                headersPromise,
                errorsPromise,
                descriptionPromise,
                endpoint.request != null ? [await this.resolveRequestBody(endpoint.request)] : [],
                endpoint.response != null ? await this.resolveResponseBody(endpoint.response) : undefined,
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

        const { auth, headers } = this.mergeAuthAndHeaders(endpoint.authed, this.apiDefinition.auth, rawHeaders);

        const toRet: ResolvedEndpointDefinition = {
            type: "endpoint",
            name: endpoint.name,
            id: endpoint.id,
            slug: endpoint.slug,
            description,
            auth,
            availability: endpoint.availability,
            apiSectionId: this.apiDefinition.api,
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
            snippetTemplates: endpoint.snippetTemplates,
        };

        toRet.examples = await Promise.all(
            endpoint.examples.map(async (example) => {
                const requestBody = this.resolveExampleEndpointRequest(
                    example.requestBodyV3,
                    toRet.requestBody[0]?.shape,
                );
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
                    ),
                };
            }),
        );

        return toRet;
    }

    async resolveRequestBody(request: APIV1Read.HttpRequest): Promise<ResolvedRequestBody> {
        const [shape, description] = await Promise.all([
            this.resolveRequestBodyShape(request.type),
            maybeSerializeMdxContent(request.description),
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
            maybeSerializeMdxContent(response.description),
        ]);
        return { shape, description, availability: undefined };
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

    async resolveWebsocketChannel(websocket: FlattenedWebSocketChannel): Promise<ResolvedWebSocketChannel> {
        const pathParametersPromise = Promise.all(
            websocket.path.pathParameters.map(
                async (parameter): Promise<ResolvedObjectProperty> => ({
                    key: parameter.key,
                    valueShape: await this.apiTypeResolver.resolveTypeReference(parameter.type),
                    description: await maybeSerializeMdxContent(parameter.description),
                    availability: parameter.availability,
                    hidden: false,
                }),
            ),
        );
        const headersPromise = Promise.all([
            ...websocket.headers.map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.apiTypeResolver.resolveTypeReference(header.type),
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
            ...this.apiDefinition.globalHeaders.map(async (header): Promise<ResolvedObjectProperty> => {
                const [valueShape, description] = await Promise.all([
                    this.apiTypeResolver.resolveTypeReference(header.type),
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
                    this.apiTypeResolver.resolveTypeReference(parameter.type),
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
                    this.resolvePayloadShape(body),
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

        const { auth, headers } = this.mergeAuthAndHeaders(websocket.authed, this.apiDefinition.auth, rawHeaders);

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

    async resolveWebhookDefinition(webhook: FlattenedWebhookDefinition): Promise<ResolvedWebhookDefinition> {
        const [payloadShape, description, headers] = await Promise.all([
            this.resolvePayloadShape(webhook.payload.type),
            await maybeSerializeMdxContent(webhook.description),
            Promise.all(
                webhook.headers.map(
                    async (header): Promise<ResolvedObjectProperty> => ({
                        key: header.key,
                        valueShape: await this.apiTypeResolver.resolveTypeReference(header.type),
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
                properties: await this.apiTypeResolver.resolveObjectProperties(object),
                description: undefined,
                availability: undefined,
            }),
            reference: (reference) => this.apiTypeResolver.resolveTypeReference(reference.value),
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
                properties: await this.apiTypeResolver.resolveObjectProperties(object),
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
                                                  const description = await maybeSerializeMdxContent(
                                                      property.value.description,
                                                  );
                                                  return {
                                                      type: property.value.type,
                                                      key: property.value.key,
                                                      description,
                                                      availability: property.value.availability,
                                                      isOptional: property.value.isOptional,
                                                  };
                                              }
                                              case "bodyProperty": {
                                                  const [description, valueShape] = await Promise.all([
                                                      maybeSerializeMdxContent(property.description),
                                                      this.apiTypeResolver.resolveTypeReference(property.valueType),
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
            reference: (reference) => this.apiTypeResolver.resolveTypeReference(reference.value),
            _other: () =>
                Promise.resolve({
                    type: "unknown",
                    availability: undefined,
                    description: undefined,
                }),
        });
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
                    properties: await this.apiTypeResolver.resolveObjectProperties(object),
                    description: undefined,
                    availability: undefined,
                }),
                fileDownload: (fileDownload) => fileDownload,
                streamingText: (streamingText) => streamingText,
                streamCondition: (streamCondition) => streamCondition,
                reference: (reference) => this.apiTypeResolver.resolveTypeReference(reference.value),
                stream: async (stream) => {
                    if (stream.shape.type === "reference") {
                        return {
                            type: "stream",
                            value: await this.apiTypeResolver.resolveTypeReference(stream.shape.value),
                        };
                    }
                    return {
                        type: "stream",
                        value: {
                            type: "object",
                            name: undefined,
                            extends: stream.shape.extends,
                            properties: await this.apiTypeResolver.resolveObjectProperties(stream.shape),
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
            stream: (stream) => ({ type: "stream", value: stream.value }),
            _other: () => undefined,
        });
    }

    safeSortKeysByShape(
        value: unknown,
        shape: ResolvedTypeShape | ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape | null | undefined,
    ): unknown {
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
                value: json.value != null ? this.safeSortKeysByShape(json.value, shape) : undefined,
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
}
