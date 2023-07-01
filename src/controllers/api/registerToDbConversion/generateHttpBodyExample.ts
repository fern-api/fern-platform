import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";
import { assertNever } from "../../../util";

export function generateHttpRequestBodyExample(
    type: ApiV1Write.HttpRequestBodyShape,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById, true);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById, true);
        case "fileUpload":
            return "<filename>";
    }
}

export function generateHttpResponseBodyExample(
    type: ApiV1Write.HttpResponseBodyShape,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById, false);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById, false);
        case "fileDownload":
            return "";
    }
}

function generateExampleObject(
    object: ApiV1Write.ObjectType,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition,
    ignoreOptionals: boolean
): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    for (const property of getAllObjectProperties(object, resolveTypeById)) {
        const value = generateExampleFromTypeReference(property.valueType, resolveTypeById, ignoreOptionals);
        if (value != null) {
            example[property.key] = value;
        }
    }
    return example;
}

function generateExampleFromId(
    id: ApiV1Write.TypeId,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition,
    ignoreOptionals: boolean
): unknown {
    const shape = resolveTypeById(id).shape;
    switch (shape.type) {
        case "object":
            return generateExampleObject(shape, resolveTypeById, ignoreOptionals);
        case "undiscriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return generateExampleFromTypeReference(shape.variants[0].type, resolveTypeById, ignoreOptionals);
        case "discriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return {
                [shape.discriminant]: shape.variants[0].discriminantValue,
                ...generateExampleObject(shape.variants[0].additionalProperties, resolveTypeById, ignoreOptionals),
            };
        case "alias":
            return generateExampleFromTypeReference(shape.value, resolveTypeById, ignoreOptionals);
        case "enum":
            return shape.values[0]?.value ?? "";
    }
}

export function generateExampleFromTypeReference(
    reference: ApiV1Write.TypeReference,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition,
    ignoreOptionals: boolean
): unknown {
    switch (reference.type) {
        case "primitive":
            return generateExamplePrimitive(reference.value);
        case "id":
            return generateExampleFromId(reference.value, resolveTypeById, ignoreOptionals);
        case "optional":
            return ignoreOptionals
                ? undefined
                : generateExampleFromTypeReference(reference.itemType, resolveTypeById, ignoreOptionals);
        case "list":
            return [generateExampleFromTypeReference(reference.itemType, resolveTypeById, ignoreOptionals)];
        case "set":
            return [generateExampleFromTypeReference(reference.itemType, resolveTypeById, ignoreOptionals)];
        case "map":
            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [generateExampleFromTypeReference(reference.keyType, resolveTypeById, ignoreOptionals) as any]:
                    generateExampleFromTypeReference(reference.valueType, resolveTypeById, ignoreOptionals),
            };
        case "unknown":
            return {};
        case "literal":
            return generateExampleFromLiteral(reference.value);
        default:
            assertNever(reference);
    }
}

export function generateExampleFromLiteral(reference: ApiV1Write.LiteralType): string {
    return reference.value;
}

function generateExamplePrimitive(reference: ApiV1Write.PrimitiveType): string | number | boolean | null {
    switch (reference.type) {
        case "string":
            return "string";
        case "integer":
            return 0;
        case "double":
            return 1.0;
        case "boolean":
            return true;
        case "long":
            return 99999;
        case "datetime":
            return "2023-01-01T00:00:00Z";
        case "uuid":
            return "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32";
        case "base64":
            return "SGVsbG8gV29ybGQ=";
        case "date":
            return "2023-01-01";
    }
}

function getAllObjectProperties(
    object: ApiV1Write.ObjectType,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): ApiV1Write.ObjectProperty[] {
    return [
        ...object.properties,
        ...object.extends.flatMap((typeId) => {
            let type = resolveTypeById(typeId);
            if (type.shape.type === "alias" && type.shape.value.type === "id") {
                type = resolveAlias(type.shape.value.value, resolveTypeById);
            }
            if (type.shape.type !== "object") {
                throw new Error("Object extends non-object " + typeId);
            }
            return getAllObjectProperties(type.shape, resolveTypeById);
        }),
    ];
}

function resolveAlias(
    typeId: ApiV1Write.TypeId,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
) {
    const resolvedTypeDefinition = resolveTypeById(typeId);
    if (resolvedTypeDefinition.shape.type === "alias" && resolvedTypeDefinition.shape.value.type === "id") {
        return resolveTypeById(resolvedTypeDefinition.shape.value.value);
    }
    return resolvedTypeDefinition;
}
