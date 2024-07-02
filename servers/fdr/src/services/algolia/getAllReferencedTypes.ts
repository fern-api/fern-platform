import { APIV1Read } from "@fern-api/fdr-sdk";
import { assertNever } from "@fern-api/fdr-sdk/src/utils";

export type ReferencedTypes = Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;

function getAllReferencedTypes({
    reference,
    types,
}: {
    reference: APIV1Read.TypeReference;
    types: Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;
}): ReferencedTypes {
    return getAllReferencedTypesFromReference({ reference, results: {}, types });
}

function getAllReferencedTypesFromReference({
    reference,
    results,
    types,
}: {
    reference: APIV1Read.TypeReference;
    results: ReferencedTypes;
    types: Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;
}): ReferencedTypes {
    switch (reference.type) {
        case "id": {
            const type = types[reference.value];
            if (type != null) {
                return {
                    ...results,
                    [reference.value]: type,
                    ...getAllReferencedTypesFromDefinition({ definition: type, results, types }),
                };
            }
            break;
        }
        case "map":
            return {
                ...results,
                ...getAllReferencedTypesFromReference({ reference: reference.keyType, results, types }),
                ...getAllReferencedTypesFromReference({ reference: reference.valueType, results, types }),
            };
        case "list":
            return {
                ...results,
                ...getAllReferencedTypesFromReference({ reference: reference.itemType, results, types }),
            };
        case "set":
            return {
                ...results,
                ...getAllReferencedTypesFromReference({ reference: reference.itemType, results, types }),
            };
        case "optional":
            return {
                ...results,
                ...getAllReferencedTypesFromReference({ reference: reference.itemType, results, types }),
            };
        case "literal":
        case "primitive":
        case "unknown":
            return results;
        default:
            assertNever(reference);
    }
    return results;
}

function getAllReferencedTypesFromDefinition({
    definition,
    results,
    types,
}: {
    definition: APIV1Read.TypeDefinition;
    results: ReferencedTypes;
    types: Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;
}): ReferencedTypes {
    switch (definition.shape.type) {
        case "object": {
            return {
                ...results,
                ...definition.shape.extends.reduce((base, value) => {
                    return {
                        ...base,
                        ...getAllReferencedTypesFromReference({
                            reference: { type: "id", value },
                            types,
                            results,
                        }),
                    };
                }, {} as ReferencedTypes),
                ...definition.shape.properties.reduce((base, value) => {
                    return {
                        ...base,
                        ...getAllReferencedTypesFromReference({ reference: value.valueType, types, results }),
                    };
                }, {} as ReferencedTypes),
            };
        }
        case "alias":
            return results;
        case "discriminatedUnion":
            return {
                ...results,
                ...definition.shape.variants.reduce((base, value) => {
                    return {
                        ...base,
                        ...getAllReferencedTypesFromDefinition({
                            definition: {
                                name: value.discriminantValue,
                                shape: { type: "object", ...value.additionalProperties },
                            },
                            types,
                            results,
                        }),
                    };
                }, {} as ReferencedTypes),
            };
        case "enum":
            return results;
        case "undiscriminatedUnion":
            return {
                ...results,
                ...definition.shape.variants.reduce((base, value) => {
                    return {
                        ...base,
                        ...getAllReferencedTypesFromReference({
                            reference: value.type,
                            types,
                            results,
                        }),
                    };
                }, {} as ReferencedTypes),
            };
        default:
            assertNever(definition.shape);
    }
}
