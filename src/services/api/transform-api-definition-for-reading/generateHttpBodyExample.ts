import * as ApiV1Write from "../../../generated/api/resources/api/resources/v1/resources/register";

export function generateHttpBodyExample(
    type: ApiV1Write.HttpBodyShape,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): unknown {
    switch (type.type) {
        case "object":
            return generateExampleObject(type, resolveTypeById);
        case "reference":
            return generateExampleFromTypeReference(type.value, resolveTypeById);
    }
}

function generateExampleObject(
    object: ApiV1Write.ObjectType,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    for (const property of getAllObjectProperties(object, resolveTypeById)) {
        example[property.key] = generateExampleFromTypeReference(property.valueType, resolveTypeById);
    }
    return example;
}

function generateExampleFromId(
    id: ApiV1Write.TypeId,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): unknown {
    const shape = resolveTypeById(id).shape;
    switch (shape.type) {
        case "object":
            return generateExampleObject(shape, resolveTypeById);
        case "undiscriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return generateExampleFromTypeReference(shape.variants[0].type, resolveTypeById);
        case "discriminatedUnion":
            if (shape.variants[0] == null) {
                return {};
            }
            return {
                [shape.discriminant]: shape.variants[0].discriminantValue,
                ...generateExampleObject(shape.variants[0].additionalProperties, resolveTypeById),
            };
        case "alias":
            return generateExampleFromTypeReference(shape.value, resolveTypeById);
        case "enum":
            return shape.values[0]?.value ?? "";
    }
}

export function generateExampleFromTypeReference(
    reference: ApiV1Write.TypeReference,
    resolveTypeById: (typeId: ApiV1Write.TypeId) => ApiV1Write.TypeDefinition
): unknown {
    switch (reference.type) {
        case "primitive":
            return generateExamplePrimitive(reference.value);
        case "id":
            return generateExampleFromId("id", resolveTypeById);
        case "optional":
            return generateExampleFromTypeReference(reference.itemType, resolveTypeById);
        case "list":
            return [generateExampleFromTypeReference(reference.itemType, resolveTypeById)];
        case "set":
            return [generateExampleFromTypeReference(reference.itemType, resolveTypeById)];
        case "map":
            return {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                [generateExampleFromTypeReference(reference.keyType, resolveTypeById) as any]:
                    generateExampleFromTypeReference(reference.valueType, resolveTypeById),
            };
        case "unknown":
            return {};
        case "literal":
            switch (reference.value.type) {
                case "stringLiteral":
                    return reference.value;
            }
    }
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
            const type = resolveTypeById(typeId);
            if (type.shape.type !== "object") {
                throw new Error("Object extends non-object " + typeId);
            }
            return getAllObjectProperties(type.shape, resolveTypeById);
        }),
    ];
}
