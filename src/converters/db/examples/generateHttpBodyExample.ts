import { APIV1Write } from "../../../api";
import { assertNever } from "../../../util";

export function generateWebhookPayloadExample(
    shape: APIV1Write.WebhookPayloadShape,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
): unknown {
    switch (shape.type) {
        case "object":
            return generateExampleObject(shape, resolveTypeById, false, new Set(), 0);
        case "reference":
            return generateExampleFromTypeReference(shape.value, resolveTypeById, false, new Set(), 0);
        default:
            assertNever(shape);
    }
}

export function generateHttpRequestBodyExample(
    type: APIV1Write.HttpRequestBodyShape,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById, true, new Set(), 0);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById, true, new Set(), 0);
        case "json":
            return generateHttpJsonRequestBodyExample(type.shape, resolveTypeById);
        case "fileUpload":
            return "<filename>";
    }
}

function generateHttpJsonRequestBodyExample(
    shape: APIV1Write.JsonRequestBodyShape,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
): unknown {
    switch (shape.type) {
        case "object":
            return generateExampleObject(shape, resolveTypeById, true, new Set(), 0);
        case "reference":
            return generateExampleFromTypeReference(shape.value, resolveTypeById, true, new Set(), 0);
        default:
            assertNever(shape);
    }
}

export function generateHttpResponseBodyExample(
    type: APIV1Write.HttpResponseBodyShape,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById, false, new Set(), 0);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById, false, new Set(), 0);
        case "fileDownload":
            return "";
        case "streamingText":
            return "example-text";
    }
}

function generateExampleObject(
    object: APIV1Write.ObjectType,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number
): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    for (const property of getAllObjectProperties(object, resolveTypeById)) {
        const value = generateExampleFromTypeReference(
            property.valueType,
            resolveTypeById,
            ignoreOptionals,
            depth === 0 ? new Set() : new Set(visited),
            depth + 1
        );
        if (value != null) {
            example[property.key] = value;
        }
    }
    return example;
}

export function generateExampleFromTypeReference(
    reference: APIV1Write.TypeReference,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number
): unknown {
    let example;

    switch (reference.type) {
        case "primitive":
            example = generateExamplePrimitive(reference.value);
            break;
        case "id": {
            visited.add(reference.value);
            example = generateExampleFromId(reference.value, resolveTypeById, ignoreOptionals, visited, depth);
            break;
        }
        case "optional":
            if (reference.itemType.type === "id") {
                if (visited.has(reference.itemType.value)) {
                    example = undefined;
                    break;
                } else {
                    visited.add(reference.itemType.value);
                }
            }
            if (ignoreOptionals) {
                example = undefined;
            } else {
                example = generateExampleFromTypeReference(
                    reference.itemType,
                    resolveTypeById,
                    ignoreOptionals,
                    visited,
                    depth
                );
            }
            break;
        case "list":
            if (reference.itemType.type === "id") {
                if (visited.has(reference.itemType.value)) {
                    example = [];
                    break;
                } else {
                    visited.add(reference.itemType.value);
                }
            }
            example = [
                generateExampleFromTypeReference(reference.itemType, resolveTypeById, ignoreOptionals, visited, depth),
            ];
            break;
        case "set":
            example = [
                generateExampleFromTypeReference(reference.itemType, resolveTypeById, ignoreOptionals, visited, depth),
            ];
            break;
        case "map":
            example = {
                [generateExampleFromTypeReference(
                    reference.keyType,
                    resolveTypeById,
                    ignoreOptionals,
                    visited,
                    depth + 1
                ) as string]: generateExampleFromTypeReference(
                    reference.valueType,
                    resolveTypeById,
                    ignoreOptionals,
                    visited,
                    depth + 1
                ),
            };
            break;
        case "unknown":
            example = {};
            break;
        case "literal":
            example = generateExampleFromLiteral(reference.value);
            break;
        default:
            assertNever(reference);
    }

    return example;
}

function generateExampleFromId(
    id: APIV1Write.TypeId,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number
): unknown {
    const shape = resolveTypeById(id).shape;
    switch (shape.type) {
        case "object":
            return generateExampleObject(shape, resolveTypeById, ignoreOptionals, visited, depth);
        case "undiscriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return generateExampleFromTypeReference(
                shape.variants[0].type,
                resolveTypeById,
                ignoreOptionals,
                visited,
                depth
            );
        case "discriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return {
                [shape.discriminant]: shape.variants[0].discriminantValue,
                ...generateExampleObject(
                    shape.variants[0].additionalProperties,
                    resolveTypeById,
                    ignoreOptionals,
                    visited,
                    depth
                ),
            };
        case "alias":
            return generateExampleFromTypeReference(shape.value, resolveTypeById, ignoreOptionals, visited, depth);
        case "enum":
            return shape.values[0]?.value ?? "";
    }
}

export function generateExampleFromLiteral(reference: APIV1Write.LiteralType): string {
    return reference.value;
}

function generateExamplePrimitive(reference: APIV1Write.PrimitiveType): string | number | boolean | null {
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
    object: APIV1Write.ObjectType,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
): APIV1Write.ObjectProperty[] {
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
    typeId: APIV1Write.TypeId,
    resolveTypeById: (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition
) {
    const resolvedTypeDefinition = resolveTypeById(typeId);
    if (resolvedTypeDefinition.shape.type === "alias" && resolvedTypeDefinition.shape.value.type === "id") {
        return resolveTypeById(resolvedTypeDefinition.shape.value.value);
    }
    return resolvedTypeDefinition;
}
