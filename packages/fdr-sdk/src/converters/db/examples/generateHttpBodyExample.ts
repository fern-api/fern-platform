import { APIV1Write } from "../../../client";
import { assertNever } from "../../utils/assertNever";

export type ResolveTypeById = (typeId: APIV1Write.TypeId) => APIV1Write.TypeDefinition;

export function generateWebhookPayloadExample(
    shape: APIV1Write.WebhookPayloadShape,
    resolveTypeById: ResolveTypeById,
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
    resolveTypeById: ResolveTypeById,
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById, true, new Set(), 0);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById, true, new Set(), 0);
        case "json":
            return generateHttpJsonRequestBodyExample(type.shape, resolveTypeById);
        case "fileUpload":
            return generateFileUploadRequestBodyExample(type.value, resolveTypeById);
        case "bytes": {
            if (type.isOptional) {
                return undefined;
            }
            const content = btoa("Hello world!");
            if (type.contentType != null) {
                return `data:${type.contentType};base64,${content}`;
            } else {
                return content;
            }
        }
    }
}

function generateFileUploadRequestBodyExample(
    fileUploadRequest: APIV1Write.FileUploadRequest | undefined,
    resolveTypeById: ResolveTypeById,
) {
    if (fileUploadRequest == null) {
        return "<filename>"; // old (deprecated) behavior
    }

    const example: Record<string, unknown> = {};
    fileUploadRequest.properties.forEach((property) => {
        switch (property.type) {
            case "file": {
                if (property.value.isOptional) {
                    break;
                }
                if (property.value.type === "fileArray") {
                    example[property.value.key] = ["<filename1>", "<filename2>"];
                } else {
                    example[property.value.key] = "<filename1>";
                }
                break;
            }
            case "bodyProperty": {
                example[property.key] = generateExampleFromTypeReference(
                    property.valueType,
                    resolveTypeById,
                    true,
                    new Set(),
                    0,
                );
                break;
            }
        }
    });

    return example;
}

function generateHttpJsonRequestBodyExample(
    shape: APIV1Write.JsonBodyShape,
    resolveTypeById: ResolveTypeById,
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
    resolveTypeById: ResolveTypeById,
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
        case "streamCondition":
            return "example-text";
        case "stream": {
            switch (type.shape.type) {
                case "object":
                    return generateExampleObject(type.shape, resolveTypeById, false, new Set(), 0);
                case "reference":
                    return generateExampleFromTypeReference(type.shape.value, resolveTypeById, false, new Set(), 0);
            }
        }
    }
}

function generateExampleObject(
    object: APIV1Write.ObjectType,
    resolveTypeById: ResolveTypeById,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number,
): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    for (const property of getAllObjectProperties(object, resolveTypeById)) {
        const value = generateExampleFromTypeReference(
            property.valueType,
            resolveTypeById,
            ignoreOptionals,
            depth === 0 ? new Set() : new Set(visited),
            depth + 1,
        );
        if (value != null) {
            example[property.key] = value;
        }
    }
    return example;
}

export function generateExampleFromTypeReference(
    reference: APIV1Write.TypeReference,
    resolveTypeById: ResolveTypeById,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number,
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
                example =
                    reference.defaultValue ??
                    generateExampleFromTypeReference(
                        reference.itemType,
                        resolveTypeById,
                        ignoreOptionals,
                        visited,
                        depth,
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
                    depth + 1,
                ) as string]: generateExampleFromTypeReference(
                    reference.valueType,
                    resolveTypeById,
                    ignoreOptionals,
                    visited,
                    depth + 1,
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
    resolveTypeById: ResolveTypeById,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number,
): unknown {
    const shape = resolveTypeById(id).shape;
    return generateExampleFromTypeShape(shape, resolveTypeById, ignoreOptionals, visited, depth);
}

export function generateExampleFromTypeShape(
    shape: APIV1Write.TypeShape,
    resolveTypeById: ResolveTypeById,
    ignoreOptionals: boolean,
    visited: Set<string>,
    depth: number,
): unknown {
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
                depth,
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
                    depth,
                ),
            };
        case "alias":
            return generateExampleFromTypeReference(shape.value, resolveTypeById, ignoreOptionals, visited, depth);
        case "enum":
            return shape.values[0]?.value ?? "";
    }
}

export function generateExampleFromLiteral(reference: APIV1Write.LiteralType): boolean | string {
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
    resolveTypeById: ResolveTypeById,
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

function resolveAlias(typeId: APIV1Write.TypeId, resolveTypeById: ResolveTypeById) {
    const resolvedTypeDefinition = resolveTypeById(typeId);
    if (resolvedTypeDefinition.shape.type === "alias" && resolvedTypeDefinition.shape.value.type === "id") {
        return resolveTypeById(resolvedTypeDefinition.shape.value.value);
    }
    return resolvedTypeDefinition;
}
