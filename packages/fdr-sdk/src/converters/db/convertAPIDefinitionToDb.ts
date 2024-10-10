import assertNever from "@fern-api/ui-core-utils/assertNever";
import titleCase from "@fern-api/ui-core-utils/titleCase";
import isEqual from "fast-deep-equal";
import { APIV1Db, APIV1Read, APIV1Write, FdrAPI } from "../../client";
import { kebabCase } from "../../utils";
import {
    generateEndpointErrorExample,
    generateEndpointNonStreamResponseExample,
    generateEndpointStreamResponseExample,
    generateEndpointSuccessExample,
} from "./examples/generateEndpointExampleCall";
import { generateWebhookExample } from "./examples/generateWebhookExample";
import { SDKSnippetHolder } from "./snippets/SDKSnippetHolder";

export function convertAPIDefinitionToDb(
    writeShape: APIV1Write.ApiDefinition,
    id: FdrAPI.ApiDefinitionId,
    snippets: SDKSnippetHolder,
): APIV1Db.DbApiDefinition {
    const subpackageToParent: Record<APIV1Write.SubpackageId, APIV1Write.SubpackageId> = {};
    for (const [parentId, parentContents] of entries(writeShape.subpackages)) {
        for (const subpackageId of parentContents.subpackages) {
            subpackageToParent[subpackageId] = parentId;
        }
    }
    const context = new ApiDefinitionTransformationContext();
    return {
        id,
        rootPackage: {
            endpoints: writeShape.rootPackage.endpoints.map(
                (endpoint) =>
                    transformEndpoint({
                        writeShape: endpoint,
                        apiDefinition: writeShape,
                        context,
                        snippets,
                    }) ?? [],
            ),
            webhooks:
                writeShape.rootPackage.webhooks?.map((webhook) =>
                    transformWebhook({ writeShape: webhook, apiDefinition: writeShape }),
                ) ?? [],
            websockets:
                writeShape.rootPackage.websockets?.map((websocket) => transformWebsocket({ writeShape: websocket })) ??
                [],
            subpackages: writeShape.rootPackage.subpackages,
            types: writeShape.rootPackage.types,
            pointsTo: undefined,
        },
        types: Object.fromEntries(
            Object.entries(writeShape.types).map(([typeId, typeDefinition]) => {
                return [typeId, transformTypeDefinition({ writeShape: typeDefinition })];
            }),
        ),
        subpackages: entries(writeShape.subpackages).reduce<
            Record<APIV1Read.SubpackageId, APIV1Db.DbApiDefinitionSubpackage>
        >((subpackages, [subpackageId, subpackage]) => {
            subpackages[subpackageId] = transformSubpackage({
                writeShape: subpackage,
                id: subpackageId,
                subpackageToParent,
                apiDefinition: writeShape,
                context,
                snippets,
            });
            return subpackages;
        }, {}),
        auth: writeShape.auth,
        globalHeaders: writeShape.globalHeaders,
        hasMultipleBaseUrls: context.hasMultipleBaseUrls(),
        navigation: writeShape.navigation,
    };
}

function transformSubpackage({
    writeShape,
    id,
    subpackageToParent,
    apiDefinition,
    context,
    snippets,
}: {
    writeShape: APIV1Write.ApiDefinitionSubpackage;
    id: APIV1Write.SubpackageId;
    subpackageToParent: Record<APIV1Write.SubpackageId, APIV1Write.SubpackageId>;
    apiDefinition: APIV1Write.ApiDefinition;
    context: ApiDefinitionTransformationContext;
    snippets: SDKSnippetHolder;
}): APIV1Db.DbApiDefinitionSubpackage {
    const parent = subpackageToParent[id];
    const endpoints = writeShape.endpoints.map((endpoint) =>
        transformEndpoint({ writeShape: endpoint, apiDefinition, context, snippets }),
    );
    const webhooks = writeShape.webhooks?.map((webhook) => transformWebhook({ writeShape: webhook, apiDefinition }));
    const websockets = writeShape.websockets?.map((websocket) => transformWebsocket({ writeShape: websocket }));
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        subpackageId: id,
        parent,
        name: writeShape.name,
        endpoints,
        websockets: websockets ?? [],
        types: writeShape.types,
        subpackages: writeShape.subpackages,
        pointsTo: writeShape.pointsTo,
        urlSlug: kebabCase(writeShape.name),
        description: writeShape.description,
        displayName: writeShape.displayName,
        // htmlDescription,
        // descriptionContainsMarkdown: true,
        webhooks: webhooks ?? [],
    };
}

function transformWebsocket({
    writeShape,
}: {
    writeShape: APIV1Write.WebSocketChannel;
}): FdrAPI.api.v1.read.WebSocketChannel {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    const urlSlug = kebabCase(writeShape.id);
    return {
        urlSlug,
        auth: writeShape.auth,
        headers: writeShape.headers,
        messages: writeShape.messages,
        availability: writeShape.availability,
        defaultEnvironment: writeShape.defaultEnvironment,
        environments: writeShape.environments,
        description: writeShape.description,
        // htmlDescription,
        // descriptionContainsMarkdown: true,
        id: writeShape.id,
        name: writeShape.name,
        path: writeShape.path,
        queryParameters: writeShape.queryParameters,
        examples: writeShape.examples,
    };
}

function transformWebhook({
    apiDefinition,
    writeShape,
}: {
    writeShape: APIV1Write.WebhookDefinition;
    apiDefinition: APIV1Write.ApiDefinition;
}): FdrAPI.api.v1.read.WebhookDefinition {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    const urlSlug = kebabCase(writeShape.id);
    const oldUrlSlug = kebabCase(writeShape.name ?? writeShape.id);
    return {
        urlSlug,
        migratedFromUrlSlugs: !isEqual(oldUrlSlug, urlSlug) ? [oldUrlSlug] : undefined,
        description: writeShape.description,
        // htmlDescription,
        // descriptionContainsMarkdown: true,
        method: writeShape.method,
        id: writeShape.id,
        name: writeShape.name,
        path: writeShape.path,
        headers: writeShape.headers,
        payload: writeShape.payload,
        examples:
            writeShape.examples.length > 0
                ? writeShape.examples
                : [generateWebhookExample({ webhookDefinition: writeShape, apiDefinition })],
    };
}

function transformEndpoint({
    writeShape,
    apiDefinition,
    context,
    snippets,
}: {
    writeShape: APIV1Write.EndpointDefinition;
    apiDefinition: APIV1Write.ApiDefinition;
    context: ApiDefinitionTransformationContext;
    snippets: SDKSnippetHolder;
}): APIV1Db.DbEndpointDefinition {
    context.registerEnvironments(writeShape.environments ?? []);
    // const htmlDescription = getHtmlDescription(writeShape.description);
    const urlSlug = kebabCase(writeShape.id);
    const oldUrlSlug = kebabCase(writeShape.name ?? writeShape.id);

    return {
        availability: writeShape.availability,
        environments: writeShape.environments,
        defaultEnvironment: writeShape.defaultEnvironment,
        urlSlug,
        // id is more unique than name, so we use that as the url slug
        // keep name as a fallback for backwards compatibility (via redirects)
        migratedFromUrlSlugs: !isEqual(oldUrlSlug, urlSlug) ? [oldUrlSlug] : undefined,
        method: writeShape.method,
        id: writeShape.id,
        originalEndpointId: writeShape.originalEndpointId,
        name: writeShape.name,
        path: writeShape.path,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        request: writeShape.request != null ? transformHttpRequestToDb({ writeShape: writeShape.request }) : undefined,
        response:
            writeShape.response != null
                ? convertResponseToDb({
                      writeShape: writeShape.response,
                      apiDefinition,
                      sdkSnippetHolder: snippets,
                      endpointDefinition: writeShape,
                  })
                : undefined,
        errors: writeShape.errors ?? [],
        errorsV2: transformErrorsV2(writeShape),
        examples: getExampleEndpointCalls({
            writeShape,
            apiDefinition,
            snippets,
        }),
        description: writeShape.description,
        // htmlDescription,
        authed: writeShape.auth,
        // descriptionContainsMarkdown: true,
        snippetTemplates: snippets.getSnippetTemplateForEndpoint({
            endpointPath: getEndpointPathAsString(writeShape),
            endpointMethod: writeShape.method,
            endpointId: writeShape.originalEndpointId,
        }),
    };
}

function transformErrorsV2(writeShape: APIV1Write.EndpointDefinition): APIV1Read.ErrorDeclarationV2[] | undefined {
    if (writeShape.errorsV2 != null) {
        return writeShape.errorsV2.map((errorV2): APIV1Read.ErrorDeclarationV2 => {
            return {
                ...errorV2,
                name: errorV2.name != null ? titleCase(errorV2.name) : undefined,
                type: errorV2.type != null ? transformShape({ writeShape: errorV2.type }) : undefined,
            };
        });
    }
    if (writeShape.errors != null) {
        return writeShape.errors.map((error): APIV1Read.ErrorDeclarationV2 => {
            return {
                name: undefined,
                examples: undefined,
                ...error,
                type:
                    error.type != null
                        ? {
                              type: "alias",
                              value: error.type,
                          }
                        : undefined,
            };
        });
    }
    return undefined;
}

function convertResponseToDb({
    writeShape,
    apiDefinition,
    endpointDefinition,
    sdkSnippetHolder,
}: {
    writeShape: APIV1Write.HttpResponse;
    apiDefinition: APIV1Write.ApiDefinition;
    endpointDefinition: APIV1Write.EndpointDefinition;
    sdkSnippetHolder: SDKSnippetHolder;
}): APIV1Read.HttpResponse {
    const writeShapeType = writeShape.type;
    switch (writeShapeType.type) {
        case "fileDownload":
        case "object":
        case "reference":
        case "streamingText":
        case "stream":
            return {
                ...writeShape,
                type: writeShapeType,
            };
        case "streamCondition":
            return {
                ...writeShape,
                type: {
                    type: "streamCondition",
                    ...convertStreamConditionToDb({
                        writeShape: writeShapeType,
                        apiDefinition,
                        endpointDefinition,
                        sdkSnippetHolder,
                    }),
                },
            };
    }
}

function convertStreamConditionToDb({
    writeShape,
    apiDefinition,
    endpointDefinition,
    sdkSnippetHolder,
}: {
    writeShape: APIV1Write.StreamConditionResponse;
    apiDefinition: APIV1Write.ApiDefinition;
    endpointDefinition: APIV1Write.EndpointDefinition;
    sdkSnippetHolder: SDKSnippetHolder;
}): APIV1Read.StreamConditionResponse {
    const nonStreamExamples =
        writeShape.response.examples ??
        generateEndpointNonStreamResponseExample({
            apiDefinition,
            nonStreamResponse: writeShape.response,
            endpointDefinition,
        });

    const streamExamples =
        writeShape.response.examples ??
        generateEndpointStreamResponseExample({
            apiDefinition,
            streamResponse: writeShape.response,
            endpointDefinition,
        });

    return {
        ...writeShape,
        response: {
            ...writeShape.response,
            examples: nonStreamExamples.map((example) => {
                return transformExampleEndpointCall({
                    writeShape: example,
                    endpointDefinition,
                    snippets: sdkSnippetHolder,
                });
            }),
        },
        streamResponse: {
            ...writeShape.streamResponse,
            examples: streamExamples.map((example) => {
                return transformExampleEndpointCall({
                    writeShape: example,
                    endpointDefinition,
                    snippets: sdkSnippetHolder,
                });
            }),
        },
    };
}

function getExampleEndpointCalls({
    writeShape,
    apiDefinition,
    snippets,
}: {
    writeShape: APIV1Write.EndpointDefinition;
    apiDefinition: APIV1Write.ApiDefinition;
    snippets: SDKSnippetHolder;
}): FdrAPI.api.v1.read.ExampleEndpointCall[] {
    const examples: APIV1Write.ExampleEndpointCall[] = [];

    const { successExamples: registeredSuccessExamples, errorExamples: registeredErrorExamples } =
        groupExamplesByStatusCode(writeShape.examples);

    if (registeredSuccessExamples.length > 0) {
        examples.push(...registeredSuccessExamples);
    } else {
        const generatedSuccessExample = generateEndpointSuccessExample({
            endpointDefinition: writeShape,
            apiDefinition,
        });
        examples.push(generatedSuccessExample);
    }

    const registeredErrorExampleStatusCodes = new Set(registeredErrorExamples.map((e) => e.responseStatusCode));
    const errorsMissingAnExample = (writeShape.errorsV2 ?? []).filter(
        (e) => !registeredErrorExampleStatusCodes.has(e.statusCode),
    );
    const generatedErrorExamples = errorsMissingAnExample.map((errorDeclaration) =>
        generateEndpointErrorExample({
            endpointDefinition: writeShape,
            apiDefinition,
            errorDeclaration,
        }),
    );

    examples.push(...registeredErrorExamples, ...generatedErrorExamples);

    return examples.map((example) =>
        transformExampleEndpointCall({
            writeShape: example,
            endpointDefinition: writeShape,
            snippets,
        }),
    );
}

function groupExamplesByStatusCode(examples: APIV1Write.ExampleEndpointCall[]) {
    const successExamples: APIV1Write.ExampleEndpointCall[] = [];
    const errorExamples: APIV1Write.ExampleEndpointCall[] = [];
    examples.forEach((example) => {
        if (example.responseStatusCode < 400) {
            successExamples.push(example);
        } else {
            errorExamples.push(example);
        }
    });
    return { successExamples, errorExamples };
}

function transformHttpRequestToDb({ writeShape }: { writeShape: APIV1Write.HttpRequest }): APIV1Db.DbHttpRequest {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    switch (writeShape.type.type) {
        case "object":
        case "reference":
            return {
                contentType: "application/json",
                description: writeShape.description,
                type: writeShape.type,
            };
        case "fileUpload": // deprecated
        case "formData":
            return {
                contentType: "multipart/form-data",
                description: writeShape.description,
                type: writeShape.type,
            };
        case "json":
            return {
                contentType: writeShape.type.contentType,
                description: writeShape.description,
                type: writeShape.type.shape,
            };
        case "bytes":
            return {
                contentType: "application/octet-stream",
                description: writeShape.description,
                type: {
                    type: "bytes",
                    isOptional: writeShape.type.isOptional,
                    contentType: writeShape.type.contentType,
                },
            };
        default:
            assertNever(writeShape.type);
    }
}

// exported for testing
export function transformExampleEndpointCall({
    writeShape,
    endpointDefinition,
    snippets,
}: {
    writeShape: APIV1Write.ExampleEndpointCall;
    endpointDefinition: APIV1Write.EndpointDefinition;
    snippets: SDKSnippetHolder;
}): FdrAPI.api.v1.read.ExampleEndpointCall {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        name: writeShape.name,
        description: writeShape.description,
        // htmlDescription,
        // descriptionContainsMarkdown: true,
        path: writeShape.path,
        pathParameters: writeShape.pathParameters,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        requestBody: writeShape.requestBody,
        responseStatusCode: writeShape.responseStatusCode,
        responseBody: writeShape.responseBody,
        codeExamples: transformCodeExamples({
            endpointDefinition,
            snippets,
            exampleId: writeShape.name,
        }),
        requestBodyV3:
            writeShape.requestBodyV3 ??
            (writeShape.requestBody != null
                ? {
                      type: "json",
                      value: writeShape.requestBody,
                  }
                : undefined),
        responseBodyV3:
            writeShape.responseBodyV3 ??
            (writeShape.responseBody != null
                ? {
                      type: "json",
                      value: writeShape.responseBody,
                  }
                : undefined),
        codeSamples: writeShape.codeSamples ?? [],
    };
}

function transformCodeExamples({
    exampleId,
    endpointDefinition,
    snippets,
}: {
    endpointDefinition: APIV1Write.EndpointDefinition;
    snippets: SDKSnippetHolder;
    exampleId: string | undefined;
}): FdrAPI.api.v1.read.CodeExamples {
    const maybePythonSnippet = snippets.getPythonCodeSnippetForEndpoint({
        endpointMethod: endpointDefinition.method,
        endpointPath: getEndpointPathAsString(endpointDefinition),
        endpointId: endpointDefinition.originalEndpointId,
        exampleId,
    });
    const maybeTypescriptSnippet = snippets.getTypeScriptCodeSnippetForEndpoint({
        endpointMethod: endpointDefinition.method,
        endpointPath: getEndpointPathAsString(endpointDefinition),
        endpointId: endpointDefinition.originalEndpointId,
        exampleId,
    });
    const maybeGoSnippet = snippets.getGoCodeSnippetForEndpoint({
        endpointMethod: endpointDefinition.method,
        endpointPath: getEndpointPathAsString(endpointDefinition),
        endpointId: endpointDefinition.originalEndpointId,
        exampleId,
    });
    const maybeRubySnippet = snippets.getRubyCodeSnippetForEndpoint({
        endpointMethod: endpointDefinition.method,
        endpointPath: getEndpointPathAsString(endpointDefinition),
        endpointId: endpointDefinition.originalEndpointId,
        exampleId,
    });
    return {
        nodeAxios: "",
        pythonSdk: maybePythonSnippet,
        typescriptSdk: maybeTypescriptSnippet,
        goSdk: maybeGoSnippet,
        rubySdk: maybeRubySnippet,
    };
}

function getEndpointPathAsString(endpoint: APIV1Write.EndpointDefinition): FdrAPI.EndpointPathLiteral {
    let endpointPath = "";
    for (const part of endpoint.path.parts) {
        if (part.type === "literal") {
            endpointPath += `${part.value}`;
        } else {
            endpointPath += `{${part.value}}`;
        }
    }
    return FdrAPI.EndpointPathLiteral(endpointPath);
}

function transformTypeDefinition({
    writeShape,
}: {
    writeShape: APIV1Write.TypeDefinition;
}): FdrAPI.api.v1.read.TypeDefinition {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        description: writeShape.description,
        availability: writeShape.availability,
        // htmlDescription,
        name: writeShape.name,
        shape: transformShape({ writeShape: writeShape.shape }),
        // descriptionContainsMarkdown: true,
    };
}

function transformShape({ writeShape }: { writeShape: APIV1Write.TypeShape }): FdrAPI.api.v1.read.TypeShape {
    switch (writeShape.type) {
        case "object":
            return {
                type: "object",
                extends: writeShape.extends,
                properties: writeShape.properties.map((property) => transformProperty({ writeShape: property })),
                extraProperties: writeShape.extraProperties,
            };
        case "alias":
            return {
                type: "alias",
                value: writeShape.value,
            };
        case "enum":
            return {
                type: "enum",
                default: writeShape.default,
                values: writeShape.values.map((enumValue) => transformEnumValue({ writeShape: enumValue })),
            };
        case "discriminatedUnion":
            return {
                type: "discriminatedUnion",
                discriminant: writeShape.discriminant,
                variants: writeShape.variants.map((variant) => transformDiscriminatedVariant({ writeShape: variant })),
            };
        case "undiscriminatedUnion":
            return {
                type: "undiscriminatedUnion",
                variants: writeShape.variants.map((variant) =>
                    transformUnDiscriminatedVariant({ writeShape: variant }),
                ),
            };
        default:
            assertNever(writeShape);
    }
}

function transformProperty({
    writeShape,
}: {
    writeShape: APIV1Write.ObjectProperty;
}): FdrAPI.api.v1.read.ObjectProperty {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        description: writeShape.description,
        availability: writeShape.availability,
        // htmlDescription,
        key: writeShape.key,
        valueType: writeShape.valueType,
        // descriptionContainsMarkdown: true,
    };
}

function transformEnumValue({ writeShape }: { writeShape: APIV1Write.EnumValue }): FdrAPI.api.v1.read.EnumValue {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        availability: writeShape.availability,
        description: writeShape.description,
        // htmlDescription,
        value: writeShape.value,
        // descriptionContainsMarkdown: true,
    };
}

function transformDiscriminatedVariant({
    writeShape,
}: {
    writeShape: APIV1Write.DiscriminatedUnionVariant;
}): FdrAPI.api.v1.read.DiscriminatedUnionVariant {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        description: writeShape.description,
        availability: writeShape.availability,
        displayName: writeShape.displayName,
        // htmlDescription,
        // descriptionContainsMarkdown: true,
        discriminantValue: writeShape.discriminantValue,
        additionalProperties: {
            extends: writeShape.additionalProperties.extends,
            properties: writeShape.additionalProperties.properties.map((property) =>
                transformProperty({ writeShape: property }),
            ),
            extraProperties: writeShape.additionalProperties.extraProperties,
        },
    };
}

function transformUnDiscriminatedVariant({
    writeShape,
}: {
    writeShape: APIV1Write.UndiscriminatedUnionVariant;
}): FdrAPI.api.v1.read.UndiscriminatedUnionVariant {
    // const htmlDescription = getHtmlDescription(writeShape.description);
    return {
        description: writeShape.description,
        availability: writeShape.availability,
        // htmlDescription,
        type: writeShape.type,
        displayName: writeShape.typeName != null ? titleCase(writeShape.typeName) : undefined,
        // descriptionContainsMarkdown: true,
    };
}

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}

class ApiDefinitionTransformationContext {
    private uniqueBaseUrls: Record<FdrAPI.EnvironmentId, Set<string>> = {};

    public registerEnvironments(environments: APIV1Write.Environment[]): void {
        for (const environment of environments) {
            const entry = this.uniqueBaseUrls[environment.id];
            if (entry != null) {
                entry.add(this.getHostEdge(environment.baseUrl));
            } else {
                this.uniqueBaseUrls[environment.id] = new Set([this.getHostEdge(environment.baseUrl)]);
            }
        }
    }

    public hasMultipleBaseUrls(): boolean {
        for (const [, hosts] of Object.entries(this.uniqueBaseUrls)) {
            if (hosts.size > 1) {
                return true;
            }
        }
        return false;
    }

    private getHostEdge(url: string) {
        const parsedBaseUrl = new URL(url);
        return parsedBaseUrl.host;
    }
}
