import { APIV1Read } from "@fern-api/fdr-sdk";
import { assertNever } from "../../util";

export type ReferencedTypes = Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;

export function getAllReferencedTypes({
    reference,
    types,
}: {
    reference: APIV1Read.TypeReference;
    types: Record<APIV1Read.TypeId, APIV1Read.TypeDefinition>;
}): ReferencedTypes {
    const visitedTypes = new Set<APIV1Read.TypeId>();
    function getAllReferencedTypesFromReference({
        reference,
        results,
    }: {
        reference: APIV1Read.TypeReference;
        results: ReferencedTypes;
    }): ReferencedTypes {
        switch (reference.type) {
            case "id": {
                if (visitedTypes.has(reference.value)) {
                    break;
                } else {
                    visitedTypes.add(reference.value);
                }
                const type = types[reference.value];
                if (type != null) {
                    return {
                        ...results,
                        [reference.value]: type,
                        ...getAllReferencedTypesFromDefinition({ definition: type, results }),
                    };
                }
                break;
            }
            case "map":
                return {
                    ...results,
                    ...getAllReferencedTypesFromReference({ reference: reference.keyType, results }),
                    ...getAllReferencedTypesFromReference({ reference: reference.valueType, results }),
                };
            case "list":
                return {
                    ...results,
                    ...getAllReferencedTypesFromReference({ reference: reference.itemType, results }),
                };
            case "set":
                return {
                    ...results,
                    ...getAllReferencedTypesFromReference({ reference: reference.itemType, results }),
                };
            case "optional":
                return {
                    ...results,
                    ...getAllReferencedTypesFromReference({ reference: reference.itemType, results }),
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
    }: {
        definition: APIV1Read.TypeDefinition;
        results: ReferencedTypes;
    }): ReferencedTypes {
        switch (definition.shape.type) {
            case "object": {
                return {
                    ...results,
                    ...definition.shape.extends.reduce<ReferencedTypes>((base, value) => {
                        return {
                            ...base,
                            ...getAllReferencedTypesFromReference({
                                reference: { type: "id", value, default: undefined },
                                results,
                            }),
                        };
                    }, {}),
                    ...definition.shape.properties.reduce<ReferencedTypes>((base, value) => {
                        return {
                            ...base,
                            ...getAllReferencedTypesFromReference({ reference: value.valueType, results }),
                        };
                    }, {}),
                };
            }
            case "alias":
                return results;
            case "discriminatedUnion":
                return {
                    ...results,
                    ...definition.shape.variants.reduce<ReferencedTypes>((base, value) => {
                        return {
                            ...base,
                            ...getAllReferencedTypesFromDefinition({
                                definition: {
                                    name: value.discriminantValue,
                                    shape: { type: "object", ...value.additionalProperties },
                                    description: undefined,
                                    availability: undefined,
                                },
                                results,
                            }),
                        };
                    }, {}),
                };
            case "enum":
                return results;
            case "undiscriminatedUnion":
                return {
                    ...results,
                    ...definition.shape.variants.reduce<ReferencedTypes>((base, value) => {
                        return {
                            ...base,
                            ...getAllReferencedTypesFromReference({
                                reference: value.type,
                                results,
                            }),
                        };
                    }, {}),
                };
            default:
                assertNever(definition.shape);
        }
    }
    return getAllReferencedTypesFromReference({ reference, results: {} });
}
