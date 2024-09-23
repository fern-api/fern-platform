import type { APIV1Read, APIV1UI } from "../client/types";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
import type { DereferencedNonOptionalTypeShapeOrReference, TypeShapeOrReference } from "./types";

export type UnwrappedReference = {
    shape: DereferencedNonOptionalTypeShapeOrReference;
    descriptions: APIV1UI.Description[];
    isOptional: boolean;
    defaultValue?: unknown;
};

type InternalDefaultValue =
    | { type: "unknown"; value: unknown }
    | { type: "typeReferenceId"; value: APIV1Read.TypeReferenceIdDefault };

/**
 * The maximum number of times to loop while unwrapping a type reference.
 * This may need to be increased if the API definition contains extremely deeply nested type references.
 */
const LOOP_TOLERANCE = 100;

/**
 * A TypeShape or TypeReference might be an alias or reference to another type.
 * This function unwraps the reference, including any optional wrappers, to get the actual shape.
 *
 * When optionals are detected, attempt to find the default value for the shape.
 * Since aliases can be recursive, the first default value found is returned, which can be contained in:
 * - the optional wrapper
 * - the type reference id
 * - the primitive or literal shape itself
 *
 * @param typeRef to unwrap
 * @param types from the API definition
 * @returns UnwrappedReference containing the shape, whether it is optional, and the default value if it exists
 */
export function unwrapReference(
    typeRef: TypeShapeOrReference,
    types: Record<string, APIV1UI.TypeDefinition>,
): UnwrappedReference;
export function unwrapReference(
    typeRef: TypeShapeOrReference | undefined,
    types: Record<string, APIV1UI.TypeDefinition>,
): UnwrappedReference | undefined;
export function unwrapReference(
    typeRef: TypeShapeOrReference | undefined,
    types: Record<string, APIV1UI.TypeDefinition>,
): UnwrappedReference | undefined {
    if (typeRef == null) {
        return undefined;
    }

    let isOptional = false;
    const defaults: InternalDefaultValue[] = [];
    const descriptions: APIV1UI.Description[] = [];

    let loop = 0;
    while (typeRef != null) {
        if (loop > LOOP_TOLERANCE) {
            // eslint-disable-next-line no-console
            console.error("Infinite loop detected while unwrapping type reference. Falling back to unknown type.");
            typeRef = undefined;
            break;
        }

        if (typeRef.type === "optional") {
            isOptional = true;
            if (typeRef.defaultValue != null) {
                defaults.push({ type: "unknown", value: typeRef.defaultValue });
            }
            typeRef = typeRef.itemShape;
        } else if (typeRef.type === "alias") {
            typeRef = typeRef.value;
        } else if (typeRef.type === "id") {
            if (typeRef.default != null) {
                defaults.push({ type: "typeReferenceId", value: typeRef.default });
            }
            const typeDef: APIV1UI.TypeDefinition | undefined = types[typeRef.value];
            if (typeDef != null) {
                typeRef = typeDef.shape;
                if (typeDef.description != null) {
                    descriptions.push(typeDef.description);
                }
            }
        } else {
            break;
        }

        loop++;
    }

    if (typeRef == null) {
        // Note: this should be a fatal error, but we're handling it gracefully for now
        // eslint-disable-next-line no-console
        console.error("Type reference is invalid. Falling back to unknown type.");
    }

    return {
        shape: typeRef ?? { type: "unknown" },
        isOptional,
        defaultValue: selectDefaultValue(typeRef, defaults),
        descriptions,
    };
}

function selectDefaultValue(
    shape: DereferencedNonOptionalTypeShapeOrReference | undefined,
    defaults: InternalDefaultValue[],
): unknown | undefined {
    // If the shape is a literal, the default value will always be the literal value
    if (shape?.type === "literal") {
        return shape.value.value;
    }

    const defaultValue = defaults.find((d) => {
        // If the shape is unknown, we can't validate the default value, so we assume it's always the first one
        if (shape == null) {
            return true;
        }

        // if a typeReferenceId is found, we need to validate that the default value is compatible with the shape
        else if (d.type === "typeReferenceId") {
            return visitDiscriminatedUnion(d.value)._visit({
                enum: () => shape?.type === "enum",
            });
        }

        // TODO: validate that the default value is compatible with the shape
        else {
            return true;
        }
    });

    if (defaultValue?.type === "unknown") {
        return defaultValue.value;
    } else if (defaultValue?.type === "typeReferenceId") {
        return defaultValue.value.value;
    } else if (shape?.type === "primitive") {
        return primitiveToDefault(shape.value);
    } else {
        return undefined;
    }
}

function primitiveToDefault(shape: APIV1Read.PrimitiveType): unknown | undefined {
    return visitDiscriminatedUnion(shape, "type")._visit<unknown | undefined>({
        string: (value) => value.default,
        integer: (value) => value.default,
        double: (value) => value.default,
        uint: () => undefined,
        uint64: () => undefined,
        boolean: (value) => value.default,
        long: (value) => value.default,
        datetime: (datetime) => datetime.default,
        uuid: (uuid) => uuid.default,
        base64: (base64) => base64.default,
        date: (value) => value.default,
        bigInteger: (value) => value.default,
        _other: () => undefined,
    });
}
