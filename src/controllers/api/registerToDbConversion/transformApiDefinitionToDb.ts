import { kebabCase } from "lodash";
import { marked } from "marked";
import { FernRegistry } from "../../../generated";
import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { assertNever, type WithoutQuestionMarks } from "../../../util";
import { generateEndpointExampleCall } from "./generateEndpointExampleCall";

export function transformApiDefinitionForDb(
    writeShape: FernRegistry.api.v1.register.ApiDefinition,
    id: FernRegistry.ApiDefinitionId
): WithoutQuestionMarks<FernRegistry.api.v1.db.DbApiDefinition> {
    const subpackageToParent: Record<
        FernRegistry.api.v1.register.SubpackageId,
        FernRegistry.api.v1.register.SubpackageId
    > = {};
    for (const [parentId, parentContents] of entries(writeShape.subpackages)) {
        for (const subpackageId of parentContents.subpackages) {
            subpackageToParent[subpackageId] = parentId;
        }
    }

    const context = new ApiDefinitionTransformationContext();

    return {
        id,
        rootPackage: {
            endpoints: writeShape.rootPackage.endpoints.map((endpoint) =>
                transformEndpoint({ writeShape: endpoint, apiDefinition: writeShape, context })
            ),
            subpackages: writeShape.rootPackage.subpackages,
            types: writeShape.rootPackage.types,
        },
        types: Object.fromEntries(
            Object.entries(writeShape.types).map(([typeId, typeDefinition]) => {
                return [typeId, transformTypeDefinition({ writeShape: typeDefinition })];
            })
        ),
        subpackages: entries(writeShape.subpackages).reduce<
            Record<FernRegistry.api.v1.read.SubpackageId, FernRegistry.api.v1.db.DbApiDefinitionSubpackage>
        >((subpackages, [subpackageId, subpackage]) => {
            subpackages[subpackageId] = transformSubpackage({
                writeShape: subpackage,
                id: subpackageId,
                subpackageToParent,
                apiDefinition: writeShape,
                context,
            });
            return subpackages;
        }, {}),
        auth: writeShape.auth,
        hasMultipleBaseUrls: context.hasMultipleBaseUrls(),
    };
}

function transformSubpackage({
    writeShape,
    id,
    subpackageToParent,
    apiDefinition,
    context,
}: {
    writeShape: FernRegistry.api.v1.register.ApiDefinitionSubpackage;
    id: FernRegistry.api.v1.register.SubpackageId;
    subpackageToParent: Record<FernRegistry.api.v1.register.SubpackageId, FernRegistry.api.v1.register.SubpackageId>;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
    context: ApiDefinitionTransformationContext;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbApiDefinitionSubpackage> {
    const parent = subpackageToParent[id];
    const endpoints = writeShape.endpoints.map((endpoint) =>
        transformEndpoint({ writeShape: endpoint, apiDefinition, context })
    );
    return {
        subpackageId: id,
        parent: parent,
        name: writeShape.name,
        endpoints: endpoints,
        types: writeShape.types,
        subpackages: writeShape.subpackages,
        pointsTo: writeShape.pointsTo,
        urlSlug: kebabCase(writeShape.name),
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
    };
}

function transformEndpoint({
    writeShape,
    apiDefinition,
    context,
}: {
    writeShape: FernRegistry.api.v1.register.EndpointDefinition;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
    context: ApiDefinitionTransformationContext;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbEndpointDefinition> {
    context.registerEnvironments(writeShape.environments ?? []);
    return {
        environments: writeShape.environments,
        defaultEnvironment: writeShape.defaultEnvironment,
        urlSlug: kebabCase(writeShape.name),
        method: writeShape.method,
        id: writeShape.id,
        name: writeShape.name,
        path: writeShape.path,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        request: writeShape.request != null ? transformHttpRequestToDb({ writeShape: writeShape.request }) : undefined,
        response: writeShape.response,
        errors: writeShape.errors ?? [],
        examples: getExampleEndpointCalls({ writeShape, apiDefinition }),
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        authed: writeShape.auth,
    };
}

function getExampleEndpointCalls({
    writeShape,
    apiDefinition,
}: {
    writeShape: FernRegistry.api.v1.register.EndpointDefinition;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
}) {
    const examples: ApiV1Write.ExampleEndpointCall[] = [];

    const { successExamples: registeredSuccessExamples, errorExamples: registeredErrorExamples } =
        groupExamplesByStatusCode(writeShape.examples);

    if (registeredSuccessExamples.length > 0) {
        examples.push(...registeredSuccessExamples);
    } else {
        const generatedSuccessExample = generateEndpointExampleCall(writeShape, apiDefinition);
        examples.push(generatedSuccessExample);
    }

    const registeredErrorExampleStatusCodes = new Set(registeredErrorExamples.map((e) => e.responseStatusCode));
    const errorsMissingAnExample = (writeShape.errors ?? []).filter(
        (e) => !registeredErrorExampleStatusCodes.has(e.statusCode)
    );
    const generatedErrorExamples = errorsMissingAnExample.map((e) =>
        generateEndpointExampleCall(writeShape, apiDefinition, e)
    );

    examples.push(...registeredErrorExamples, ...generatedErrorExamples);

    return examples.map((example) =>
        transformExampleEndpointCall({
            writeShape: example,
            endpointDefinition: writeShape,
        })
    );
}

function groupExamplesByStatusCode(examples: ApiV1Write.ExampleEndpointCall[]) {
    const successExamples: ApiV1Write.ExampleEndpointCall[] = [];
    const errorExamples: ApiV1Write.ExampleEndpointCall[] = [];
    examples.forEach((example) => {
        if (example.responseStatusCode >= 200 && example.responseStatusCode < 300) {
            successExamples.push(example);
        } else {
            errorExamples.push(example);
        }
    });
    return { successExamples, errorExamples };
}

function transformHttpRequestToDb({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.HttpRequest;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbHttpRequest> {
    switch (writeShape.type.type) {
        case "object":
            return {
                contentType: "application/json",
                description: writeShape.description,
                htmlDescription: getHtmlDescription(writeShape.description),
                type: writeShape.type,
            };
        case "reference":
            return {
                contentType: "application/json",
                description: writeShape.description,
                htmlDescription: getHtmlDescription(writeShape.description),
                type: writeShape.type,
            };
        case "fileUpload":
            return {
                contentType: "multipart/form-data",
                description: writeShape.description,
                htmlDescription: getHtmlDescription(writeShape.description),
                type: writeShape.type,
            };
        case "json":
            return {
                contentType: writeShape.type.contentType,
                description: writeShape.description,
                htmlDescription: getHtmlDescription(writeShape.description),
                type: writeShape.type.shape,
            };
        default:
            assertNever(writeShape.type);
    }
}

// exported for testing
export function transformExampleEndpointCall({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.ExampleEndpointCall;
    endpointDefinition: FernRegistry.api.v1.register.EndpointDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ExampleEndpointCall> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        path: writeShape.path,
        pathParameters: writeShape.pathParameters,
        queryParameters: writeShape.queryParameters,
        headers: writeShape.headers,
        requestBody: writeShape.requestBody,
        responseStatusCode: writeShape.responseStatusCode,
        responseBody: writeShape.responseBody,
        codeExamples: {
            nodeAxios: "",
        },
        requestBodyV2: undefined,
        responseBodyV2: undefined,
    };
}

function transformTypeDefinition({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.TypeDefinition;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.TypeDefinition> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        name: writeShape.name,
        shape: transformShape({ writeShape: writeShape.shape }),
    };
}

function transformShape({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.TypeShape;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.TypeShape> {
    switch (writeShape.type) {
        case "object":
            return {
                type: "object",
                extends: writeShape.extends,
                properties: writeShape.properties.map((property) => transformProperty({ writeShape: property })),
            };
        case "alias":
            return {
                type: "alias",
                value: writeShape.value,
            };
        case "enum":
            return {
                type: "enum",
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
                    transformUnDiscriminatedVariant({ writeShape: variant })
                ),
            };
        default:
            assertNever(writeShape);
    }
}

function transformProperty({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.ObjectProperty;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.ObjectProperty> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        key: writeShape.key,
        valueType: writeShape.valueType,
    };
}

function transformEnumValue({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.EnumValue;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.EnumValue> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        value: writeShape.value,
    };
}

function transformDiscriminatedVariant({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.DiscriminatedUnionVariant;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.DiscriminatedUnionVariant> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        discriminantValue: writeShape.discriminantValue,
        additionalProperties: {
            extends: writeShape.additionalProperties.extends,
            properties: writeShape.additionalProperties.properties.map((property) =>
                transformProperty({ writeShape: property })
            ),
        },
    };
}

function transformUnDiscriminatedVariant({
    writeShape,
}: {
    writeShape: FernRegistry.api.v1.register.UndiscriminatedUnionVariant;
}): WithoutQuestionMarks<FernRegistry.api.v1.read.UndiscriminatedUnionVariant> {
    return {
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        type: writeShape.type,
    };
}

function getHtmlDescription(description: string | undefined): string | undefined {
    return description != null ? marked(description, { mangle: false, headerIds: false }) : undefined;
}

function entries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
    return Object.entries(obj) as [keyof T, T[keyof T]][];
}

class ApiDefinitionTransformationContext {
    private uniqueBaseUrls: Record<FernRegistry.api.v1.register.EnvironmentId, Set<string>> = {};

    public registerEnvironments(environments: FernRegistry.api.v1.register.Environment[]): void {
        for (const environment of environments) {
            const entry = this.uniqueBaseUrls[environment.id];
            if (entry != null) {
                entry.add(this.getHost(environment.baseUrl));
            } else {
                this.uniqueBaseUrls[environment.id] = new Set([this.getHost(environment.baseUrl)]);
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

    private getHost(url: string) {
        const parsedBaseUrl = new URL(url);
        return parsedBaseUrl.host;
    }
}
