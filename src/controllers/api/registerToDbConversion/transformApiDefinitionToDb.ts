import { kebabCase } from "lodash";
import { marked } from "marked";
import { FernRegistry } from "../../../generated";
import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { EndpointExampleGenerationError } from "../../../generated/api/resources/api/resources/v1/resources/register/errors";
import { assertNever, type WithoutQuestionMarks } from "../../../util";
import { generateDummyEndpointExampleCall } from "./generateDummyEndpointExampleCall";

export function transformApiDefinitionForDb(
    writeShape: FernRegistry.api.v1.register.ApiDefinition,
    id: FernRegistry.ApiDefinitionId,
    endpointId: string
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

    return {
        id,
        rootPackage: {
            endpoints: writeShape.rootPackage.endpoints.map((endpoint) =>
                transformEndpoint({ writeShape: endpoint, apiDefinition: writeShape, endpointId })
            ),
            subpackages: writeShape.rootPackage.subpackages,
            types: writeShape.rootPackage.types,
        },
        types: Object.fromEntries(
            Object.entries(writeShape.types).map(([typeId, typeDefinition]) => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
                endpointId,
            });
            return subpackages;
        }, {}),
        auth: writeShape.auth,
    };
}

function transformSubpackage({
    writeShape,
    id,
    subpackageToParent,
    apiDefinition,
    endpointId,
}: {
    writeShape: FernRegistry.api.v1.register.ApiDefinitionSubpackage;
    id: FernRegistry.api.v1.register.SubpackageId;
    subpackageToParent: Record<FernRegistry.api.v1.register.SubpackageId, FernRegistry.api.v1.register.SubpackageId>;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
    endpointId: string;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbApiDefinitionSubpackage> {
    const parent = subpackageToParent[id];
    const endpoints = writeShape.endpoints.map((endpoint) =>
        transformEndpoint({ writeShape: endpoint, apiDefinition, endpointId })
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
    endpointId,
}: {
    writeShape: FernRegistry.api.v1.register.EndpointDefinition;
    apiDefinition: FernRegistry.api.v1.register.ApiDefinition;
    endpointId: string;
}): WithoutQuestionMarks<FernRegistry.api.v1.db.DbEndpointDefinition> {
    let examples: ApiV1Write.ExampleEndpointCall[] = [];
    if (writeShape.examples.length > 0) {
        examples = [...writeShape.examples];
    } else {
        try {
            examples = [generateDummyEndpointExampleCall(writeShape, apiDefinition)];
        } catch (err) {
            console.error("Failed to generate example", err);
            throw new EndpointExampleGenerationError({ endpointId });
        }
    }
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
        request: writeShape.request,
        response: writeShape.response,
        errors: writeShape.errors ?? [],
        examples: examples.map((example) =>
            transformExampleEndpointCall({
                writeShape: example,
                endpointDefinition: writeShape,
            })
        ),
        description: writeShape.description,
        htmlDescription: getHtmlDescription(writeShape.description),
        authed: writeShape.auth,
    };
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
