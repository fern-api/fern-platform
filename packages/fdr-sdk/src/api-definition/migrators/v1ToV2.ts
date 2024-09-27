import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { APIV1Read } from "../../client";
import { SupportedLanguage } from "../../client/generated/api/resources/api/resources/v1/resources/read/resources/endpoint/types/SupportedLanguage";
import { ROOT_PACKAGE_ID } from "../../navigation/consts";
import { LOOP_TOLERANCE } from "../const";
import * as V2 from "../latest";
import { convertToCurl } from "../snippets/curl";
import { toHttpRequest } from "../snippets/HttpRequest";
import { sortKeysByShape } from "../sort-keys";

interface Flags {
    /**
     * If true, rename the language "typescript" to "javascript" in the code snippets.
     * This works for now because the TypeScript SDK snippets don't use TypeScript-specific features.
     * But if they do in the future, we'll need to generate separate TypeScript and JavaScript snippets.
     */
    useJavaScriptAsTypeScript: boolean;

    /**
     * If true, avoid generating Typescript SDK snippets.
     * In @fern-ui/ui's resolver, we generate http-snippets for JavaScript.
     */
    alwaysEnableJavaScriptFetch: boolean;

    /**
     * If true, the generated form data snippet will always include the `application/json` content type.
     */
    usesApplicationJsonInFormDataValue: boolean;
}

function isSubpackage(package_: APIV1Read.ApiDefinitionPackage): package_ is APIV1Read.ApiDefinitionSubpackage {
    return typeof (package_ as APIV1Read.ApiDefinitionSubpackage).subpackageId === "string";
}

const AUTH_SCHEME_ID = V2.AuthSchemeId("default");

export class ApiDefinitionV1ToLatest {
    static from(v1: APIV1Read.ApiDefinition, flags: Flags): ApiDefinitionV1ToLatest {
        return new ApiDefinitionV1ToLatest(v1, flags);
    }

    private auth: APIV1Read.ApiAuth | undefined;
    private constructor(
        private readonly v1: APIV1Read.ApiDefinition,
        private readonly flags: Flags,
    ) {
        this.auth = v1.auth;
    }

    static createEndpointId(
        endpoint: APIV1Read.EndpointDefinition,
        subpackageId: string = ROOT_PACKAGE_ID,
    ): V2.EndpointId {
        return V2.EndpointId(endpoint.originalEndpointId ?? `${subpackageId}.${endpoint.id}`);
    }

    static createWebSocketId(
        webSocket: APIV1Read.WebSocketChannel,
        subpackageId: string = ROOT_PACKAGE_ID,
    ): V2.WebSocketId {
        return V2.WebSocketId(`${subpackageId}.${webSocket.id}`);
    }

    static createWebhookId(webhook: APIV1Read.WebhookDefinition, subpackageId: string = ROOT_PACKAGE_ID): V2.WebhookId {
        return V2.WebhookId(`${subpackageId}.${webhook.id}`);
    }

    private endpoints: Record<V2.EndpointId, V2.EndpointDefinition> = {};
    private websockets: Record<V2.WebSocketId, V2.WebSocketChannel> = {};
    private webhooks: Record<V2.WebhookId, V2.WebhookDefinition> = {};
    private subpackages: Record<V2.SubpackageId, V2.SubpackageMetadata> = {};
    private types: Record<string, V2.TypeDefinition> = {};
    public migrate = (): V2.ApiDefinition => {
        Object.entries(this.v1.types).forEach(([id, type]) => {
            this.types[V2.TypeId(id)] = {
                name: type.name,
                description: type.description,
                availability: type.availability,
                shape: this.migrateTypeShape(type.shape),
            };
        });

        [this.v1.rootPackage, ...Object.values(this.v1.subpackages)].forEach((pkg) => {
            const [subpackageId, namespace] = this.collectNamespace(pkg, this.v1.subpackages);
            pkg.endpoints.forEach((endpoint) => {
                const id = ApiDefinitionV1ToLatest.createEndpointId(endpoint, subpackageId);
                this.endpoints[id] = this.migrateEndpoint(id, endpoint, namespace);
            });
            pkg.websockets.forEach((webSocket) => {
                const id = ApiDefinitionV1ToLatest.createWebSocketId(webSocket, subpackageId);
                this.websockets[id] = this.migrateWebSocket(id, webSocket, namespace);
            });
            pkg.webhooks.forEach((webhook) => {
                const id = ApiDefinitionV1ToLatest.createWebhookId(webhook, subpackageId);
                this.webhooks[id] = this.migrateWebhook(id, webhook, namespace);
            });
        });

        Object.values(this.v1.subpackages).forEach((subpackage) => {
            this.subpackages[subpackage.subpackageId] = this.migrateSubpackage(subpackage);
        });

        return {
            id: this.v1.id,
            endpoints: this.endpoints,
            websockets: this.websockets,
            webhooks: this.webhooks,
            types: this.types,
            subpackages: this.subpackages,
            auths: this.v1.auth ? { [AUTH_SCHEME_ID]: this.v1.auth } : {},
            globalHeaders: this.migrateParameters(this.v1.globalHeaders),
        };
    };

    collectNamespace = (
        pkg: APIV1Read.ApiDefinitionPackage,
        subpackages: Record<string, APIV1Read.ApiDefinitionSubpackage>,
    ): [string, V2.SubpackageId[]] => {
        if (!isSubpackage(pkg)) {
            return [ROOT_PACKAGE_ID, []];
        }
        const namespace: V2.SubpackageId[] = [pkg.subpackageId];

        let subpackage = pkg;
        let loop = 0;
        while (subpackage.parent != null) {
            if (loop > LOOP_TOLERANCE) {
                throw new Error("Circular subpackage reference detected");
            }

            const next = subpackages[subpackage.parent];
            if (next == null) {
                break;
            }
            namespace.unshift(subpackage.parent);
            subpackage = next;
            loop++;
        }

        return [pkg.subpackageId, namespace];
    };

    migrateEndpoint = (
        id: V2.EndpointId,
        v1: APIV1Read.EndpointDefinition,
        namespace: V2.SubpackageId[],
    ): V2.EndpointDefinition => {
        const toRet: V2.EndpointDefinition = {
            id,
            namespace,
            description: v1.description,
            availability: v1.availability,
            method: v1.method,
            path: v1.path.parts.filter((part) => part.value !== ""),
            auth: v1.authed ? [AUTH_SCHEME_ID] : undefined,
            defaultEnvironment: v1.defaultEnvironment,
            environments: v1.environments,
            pathParameters: this.migrateParameters(v1.path.pathParameters),
            queryParameters: this.migrateParameters(v1.queryParameters),
            requestHeaders: this.migrateParameters(v1.headers),
            responseHeaders: undefined,
            request: this.migrateHttpRequest(v1.request),
            response: this.migrateHttpResponse(v1.response),
            errors: this.migrateHttpErrors(v1.errorsV2),
            examples: undefined,
            snippetTemplates: v1.snippetTemplates,
        };

        toRet.examples = this.migrateHttpExamples(v1.examples, toRet);

        return toRet;
    };

    migrateWebSocket = (
        id: V2.WebSocketId,
        v1: APIV1Read.WebSocketChannel,
        namespace: V2.SubpackageId[],
    ): V2.WebSocketChannel => {
        return {
            id,
            namespace,
            description: v1.description,
            availability: v1.availability,
            path: v1.path.parts.filter((part) => part.value !== ""),
            messages: this.migrateChannelMessages(v1.messages),
            auth: v1.auth ? [AUTH_SCHEME_ID] : undefined,
            defaultEnvironment: v1.defaultEnvironment,
            environments: v1.environments,
            pathParameters: this.migrateParameters(v1.path.pathParameters),
            queryParameters: this.migrateParameters(v1.queryParameters),
            requestHeaders: this.migrateParameters(v1.headers),
            examples: this.migrateChannelExamples(v1.examples),
        };
    };

    migrateWebhook = (
        id: V2.WebhookId,
        v1: APIV1Read.WebhookDefinition,
        namespace: V2.SubpackageId[],
    ): V2.WebhookDefinition => {
        return {
            id,
            namespace,
            description: v1.description,
            availability: undefined,
            method: v1.method,
            path: v1.path,
            headers: this.migrateParameters(v1.headers),
            payload: this.migrateWebhookPayload(v1.payload),
            examples: v1.examples,
        };
    };

    migrateSubpackage = (subpackage: APIV1Read.ApiDefinitionSubpackage): V2.SubpackageMetadata => {
        return {
            id: subpackage.subpackageId,
            name: subpackage.name,
            displayName: subpackage.displayName,
        };
    };

    migrateParameters = (
        v1: APIV1Read.PathParameter[] | APIV1Read.QueryParameter[] | APIV1Read.Header[] | undefined,
    ): V2.ObjectProperty[] | undefined => {
        if (v1 == null || v1.length === 0) {
            return undefined;
        }
        return v1.map((parameter) => ({
            key: V2.PropertyKey(parameter.key),
            valueShape: this.migrateTypeReference(parameter.type),
            description: parameter.description,
            availability: parameter.availability,
        }));
    };

    migrateTypeReference = (typeRef: APIV1Read.TypeReference): V2.TypeReference => {
        return visitDiscriminatedUnion(typeRef)._visit<V2.TypeReference>({
            map: (value) => ({
                type: "map",
                keyShape: this.migrateTypeReference(value.keyType),
                valueShape: this.migrateTypeReference(value.valueType),
            }),
            id: (value) => ({
                type: "id",
                id: value.value,
                default: value.default,
            }),
            primitive: (value) => value,
            optional: (value) => ({
                type: "optional",
                shape: this.migrateTypeReference(value.itemType),
                default: value.defaultValue,
            }),
            list: (value) => ({
                type: "list",
                itemShape: this.migrateTypeReference(value.itemType),
            }),
            set: (value) => ({
                type: "set",
                itemShape: this.migrateTypeReference(value.itemType),
            }),
            literal: (value) => value,
            unknown: () => ({
                type: "unknown",
                displayName: undefined,
            }),
        });
    };

    migrateTypeShape = (shape: APIV1Read.TypeShape): V2.TypeShape => {
        return visitDiscriminatedUnion(shape)._visit<V2.TypeShape>({
            object: (value) => ({
                type: "object",
                extends: value.extends,
                properties: this.migrateObjectProperties(value.properties),
            }),
            alias: (value) => ({
                type: "alias",
                value: this.migrateTypeReference(value.value),
            }),
            enum: (value) => value,
            undiscriminatedUnion: (value) => ({
                type: "undiscriminatedUnion",
                variants: value.variants.map((variant) => ({
                    displayName: variant.displayName,
                    shape: this.migrateTypeReference(variant.type),
                    description: variant.description,
                    availability: variant.availability,
                })),
            }),
            discriminatedUnion: (value) => ({
                type: "discriminatedUnion",
                discriminant: V2.PropertyKey(value.discriminant),
                variants: value.variants.map((variant) => ({
                    discriminantValue: variant.discriminantValue,
                    displayName: variant.displayName,
                    description: variant.description,
                    availability: variant.availability,
                    extends: variant.additionalProperties.extends,
                    properties: this.migrateObjectProperties(variant.additionalProperties.properties),
                })),
            }),
        });
    };

    migrateObjectProperties = (properties: APIV1Read.ObjectProperty[]): V2.ObjectProperty[] => {
        return properties.map((value) => ({
            key: V2.PropertyKey(value.key),
            valueShape: this.migrateTypeReference(value.valueType),
            description: value.description,
            availability: value.availability,
        }));
    };

    migrateJsonShape = (shape: APIV1Read.JsonBodyShape): V2.TypeShape => {
        return visitDiscriminatedUnion(shape)._visit<V2.TypeShape>({
            object: this.migrateTypeShape,
            reference: (ref) => ({ type: "alias", value: this.migrateTypeReference(ref.value) }),
        });
    };

    migrateWebhookPayload = (payload: APIV1Read.WebhookPayload): V2.WebhookPayload => {
        return {
            description: payload.description,
            shape: this.migrateJsonShape(payload.type),
        };
    };

    migrateChannelExamples = (
        examples: APIV1Read.ExampleWebSocketSession[],
    ): V2.ExampleWebSocketSession[] | undefined => {
        if (examples.length === 0) {
            return undefined;
        }

        return examples.map((example) => ({
            description: example.description,
            path: example.path,
            name: example.name,
            pathParameters: example.pathParameters,
            queryParameters: example.queryParameters,
            requestHeaders: example.headers,
            messages: example.messages,
        }));
    };

    migrateChannelMessages = (messages: APIV1Read.WebSocketMessage[]): V2.WebSocketMessage[] => {
        return messages.map((message) => ({
            type: message.type,
            displayName: message.displayName,
            origin: message.origin,
            body: this.migrateJsonShape(message.body),
            description: message.description,
            availability: message.availability,
        }));
    };

    migrateHttpExamples = (
        examples: APIV1Read.ExampleEndpointCall[],
        endpoint: V2.EndpointDefinition,
    ): V2.ExampleEndpointCall[] | undefined => {
        if (examples.length === 0) {
            return undefined;
        }
        return examples.map((example): V2.ExampleEndpointCall => {
            const toRet: V2.ExampleEndpointCall = {
                path: example.path,
                responseStatusCode: example.responseStatusCode,
                name: example.name,
                description: example.description,
                pathParameters: example.pathParameters,
                queryParameters: example.queryParameters,
                headers: example.headers,
                requestBody: example.requestBodyV3,
                responseBody: example.responseBodyV3,
                snippets: undefined,
            };

            if (toRet.requestBody) {
                toRet.requestBody.value = sortKeysByShape(toRet.requestBody.value, endpoint.request?.body, this.types);
            }

            if (toRet.responseBody) {
                toRet.responseBody.value = sortKeysByShape(
                    toRet.responseBody.value,
                    endpoint.response?.body,
                    this.types,
                );
            }

            toRet.snippets = this.migrateEndpointSnippets(endpoint, example, this.auth, this.flags);

            return toRet;
        });
    };

    migrateHttpErrors = (errors: APIV1Read.ErrorDeclarationV2[] | undefined): V2.ErrorResponse[] | undefined => {
        if (errors == null || errors.length === 0) {
            return undefined;
        }

        return errors.map((value) => ({
            description: value.description,
            availability: value.availability,
            name: value.name,
            statusCode: value.statusCode,
            shape: value.type != null ? this.migrateTypeShape(value.type) : undefined,
            examples: value.examples,
        }));
    };

    migrateHttpResponse = (response: APIV1Read.HttpResponse | undefined): V2.HttpResponse | undefined => {
        if (response == null) {
            return undefined;
        }

        return {
            description: response.description,
            statusCode: response.statusCode ?? 200,
            body: visitDiscriminatedUnion(response.type)._visit<V2.HttpResponseBodyShape>({
                object: (value) => ({
                    type: "object",
                    extends: value.extends,
                    properties: this.migrateObjectProperties(value.properties),
                }),
                reference: (value) => ({
                    type: "alias",
                    value: this.migrateTypeReference(value.value),
                }),
                fileDownload: (value) => value,
                streamingText: (value) => value,
                stream: (value) => ({
                    type: "stream",
                    terminator: value.terminator,
                    shape: this.migrateJsonShape(value.shape),
                }),

                // Careful! we're dropping non-streaming response shape in the following migration:
                streamCondition: (value) => ({
                    type: "stream",
                    terminator: undefined,
                    shape: this.migrateJsonShape(value.streamResponse.shape),
                }),
            }),
        };
    };

    migrateHttpRequest = (request: APIV1Read.HttpRequest | undefined): V2.HttpRequest | undefined => {
        if (request == null) {
            return undefined;
        }

        return {
            description: request.description,
            contentType: request.contentType,
            body: visitDiscriminatedUnion(request.type)._visit<V2.HttpRequestBodyShape>({
                object: (value) => ({
                    type: "object",
                    extends: value.extends,
                    properties: this.migrateObjectProperties(value.properties),
                }),
                reference: (value) => ({
                    type: "alias",
                    value: this.migrateTypeReference(value.value),
                }),
                bytes: (value) => ({
                    type: "bytes",
                    isOptional: value.isOptional,
                    contentType: value.contentType,
                }),
                formData: (value) => ({
                    type: "formData",
                    description: value.description,
                    availability: value.availability,
                    fields: this.migrateFormDataProperties(value.properties),
                }),
                fileUpload: (value) => ({
                    type: "formData",
                    description: value.value?.description,
                    availability: value.value?.availability,
                    fields: this.migrateFormDataProperties(value.value?.properties ?? []),
                }),
            }),
        };
    };

    migrateFormDataProperties = (properties: APIV1Read.FormDataProperty[]): V2.FormDataField[] => {
        return properties.map((prop) =>
            visitDiscriminatedUnion(prop)._visit<V2.FormDataField>({
                file: (file) =>
                    visitDiscriminatedUnion(file.value)._visit<V2.FormDataField>({
                        file: (single) => ({
                            type: "file",
                            key: single.key,
                            isOptional: single.isOptional,
                            contentType: single.contentType,
                            description: single.description,
                            availability: single.availability,
                        }),
                        fileArray: (multiple) => ({
                            type: "files",
                            key: multiple.key,
                            isOptional: multiple.isOptional,
                            contentType: multiple.contentType,
                            description: multiple.description,
                            availability: multiple.availability,
                        }),
                    }),
                bodyProperty: (bodyProp) => ({
                    type: "property",
                    key: bodyProp.key,
                    contentType: bodyProp.contentType,
                    description: bodyProp.description,
                    availability: bodyProp.availability,
                    valueShape: this.migrateTypeReference(bodyProp.valueType),
                }),
            }),
        );
    };

    migrateEndpointSnippets(
        endpoint: V2.EndpointDefinition,
        example: APIV1Read.ExampleEndpointCall,
        auth: APIV1Read.ApiAuth | undefined,
        flags: Flags,
    ): Record<string, V2.CodeSnippet[]> {
        const toRet: Record<string, V2.CodeSnippet[]> = {};
        function push(language: string, snippet: V2.CodeSnippet) {
            (toRet[language] ??= []).push(snippet);
        }

        const userProvidedLanguages = new Set<string>();

        // Add user-provided code snippets
        example.codeSamples.forEach((codeSample) => {
            const language = this.#cleanLanguage(codeSample.language);
            userProvidedLanguages.add(language);

            push(language, {
                name: codeSample.name,
                language,
                install: codeSample.install,
                code: codeSample.code,
                generated: false,
                description: codeSample.description,
            });
        });

        if (!userProvidedLanguages.has(SupportedLanguage.Curl)) {
            const code = convertToCurl(toHttpRequest(endpoint, example, this.auth), flags);
            push(SupportedLanguage.Curl, {
                language: SupportedLanguage.Curl,
                code,
                name: undefined,
                install: undefined,
                generated: true,
                description: undefined,
            });
        }

        if (!userProvidedLanguages.has(SupportedLanguage.Python) && example.codeExamples.pythonSdk != null) {
            push(SupportedLanguage.Python, {
                name: undefined,
                language: SupportedLanguage.Python,
                install: example.codeExamples.pythonSdk.install,
                code: example.codeExamples.pythonSdk.sync_client,
                generated: true,
                description: undefined,
            });
        }

        const jsLang = flags.useJavaScriptAsTypeScript ? SupportedLanguage.Javascript : SupportedLanguage.Typescript;
        const jsLangName = flags.useJavaScriptAsTypeScript ? "JavaScript" : "TypeScript";
        if (
            !flags.alwaysEnableJavaScriptFetch &&
            !userProvidedLanguages.has(jsLang) &&
            example.codeExamples.typescriptSdk != null
        ) {
            push(jsLang, {
                name: `${jsLangName} SDK`,
                language: jsLang,
                install: example.codeExamples.typescriptSdk.install,
                code: example.codeExamples.typescriptSdk.client,
                generated: true,
                description: undefined,
            });
        }

        if (!userProvidedLanguages.has(SupportedLanguage.Go) && example.codeExamples.goSdk != null) {
            push(SupportedLanguage.Go, {
                name: undefined,
                language: SupportedLanguage.Go,
                install: example.codeExamples.goSdk.install,
                code: example.codeExamples.goSdk.client,
                generated: true,
                description: undefined,
            });
        }

        if (!userProvidedLanguages.has(SupportedLanguage.Ruby) && example.codeExamples.rubySdk != null) {
            push(SupportedLanguage.Ruby, {
                name: undefined,
                language: SupportedLanguage.Ruby,
                install: example.codeExamples.rubySdk.install,
                code: example.codeExamples.rubySdk.client,
                generated: true,
                description: undefined,
            });
        }

        return toRet;
    }

    #cleanLanguage(language: string): string {
        language = language.toLowerCase().trim();
        if (["node", "nodejs", "js", "javascript"].includes(language)) {
            return SupportedLanguage.Javascript;
        }

        if (["py", "python"].includes(language)) {
            return SupportedLanguage.Python;
        }

        if (["ts", "typescript", "ts-node"].includes(language)) {
            return SupportedLanguage.Typescript;
        }

        if (["go", "golang"].includes(language)) {
            return SupportedLanguage.Go;
        }

        return language;
    }
}
