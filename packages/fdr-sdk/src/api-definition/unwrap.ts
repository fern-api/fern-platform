import { isPlainObject } from "@fern-api/ui-core-utils";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import compact from "lodash-es/compact";
import sortBy from "lodash-es/sortBy";
import type * as FernDocs from "../docs";
import { AvailabilityOrder, coalesceAvailability } from "./availability";
import { LOOP_TOLERANCE } from "./const";
import * as Latest from "./latest";
import type { DereferencedNonOptionalTypeShapeOrReference, TypeShapeOrReference } from "./types";

export type UnwrappedReference = {
    shape: DereferencedNonOptionalTypeShapeOrReference;
    availability: Latest.Availability | undefined;
    descriptions: FernDocs.MarkdownText[];
    isOptional: boolean;
    default?: unknown;
};

export type UnwrappedObjectType = {
    properties: Latest.ObjectProperty[];
    descriptions: FernDocs.MarkdownText[];
};

type InternalDefaultValue =
    | { type: "unknown"; value: unknown }
    | { type: "typeReferenceId"; value: Latest.TypeReferenceIdDefault };

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
    types: Record<string, Latest.TypeDefinition>,
): UnwrappedReference;
export function unwrapReference(
    typeRef: TypeShapeOrReference | undefined,
    types: Record<string, Latest.TypeDefinition>,
): UnwrappedReference | undefined;
export function unwrapReference(
    typeRef: TypeShapeOrReference | undefined,
    types: Record<string, Latest.TypeDefinition>,
): UnwrappedReference | undefined {
    if (typeRef == null) {
        return undefined;
    }

    let isOptional = false;
    const defaults: InternalDefaultValue[] = [];
    const descriptions: FernDocs.MarkdownText[] = [];
    const availabilities: Latest.Availability[] = [];

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
            if (typeRef.default != null) {
                defaults.push({ type: "unknown", value: typeRef.default });
            }
            typeRef = typeRef.shape;
        } else if (typeRef.type === "alias") {
            typeRef = typeRef.value;
        } else if (typeRef.type === "id") {
            if (typeRef.default != null) {
                defaults.push({ type: "typeReferenceId", value: typeRef.default });
            }
            const typeDef: Latest.TypeDefinition | undefined = types[typeRef.id];
            if (typeDef != null) {
                if (typeDef.availability) {
                    availabilities.push(typeDef.availability);
                }

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
        shape: typeRef ?? { type: "unknown", displayName: undefined },
        availability: coalesceAvailability(availabilities),
        isOptional,
        default: selectDefaultValue(typeRef, defaults),
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
    } else if (shape?.type === "enum") {
        return shape.default;
    } else {
        return undefined;
    }
}

/**
 * Dereferences extended objects and returns all properties of the object.
 * If an object extends another object, the properties of the extended object will be sorted alphabetically.
 * Additionally, required properties will come before optional properties.
 *
 * @param object to dereference
 * @param types from the API definition
 * @returns the properties of the object, including properties from extended objects
 */
export function unwrapObjectType(
    object: Latest.ObjectType,
    types: Record<string, Latest.TypeDefinition>,
): UnwrappedObjectType {
    const directProperties = object.properties;
    const descriptions: FernDocs.MarkdownText[] = [];
    const extendedProperties = object.extends.flatMap((typeId): Latest.ObjectProperty[] => {
        const typeDef = types[typeId];
        if (typeDef?.description) {
            descriptions.push(typeDef.description);
        }

        const unwrapped = unwrapReference(typeDef?.shape, types);
        unwrapped?.descriptions.forEach((description) => descriptions.push(description));

        // TODO: should we be able to extend discriminated and undiscriminated unions?
        if (unwrapped?.shape.type !== "object") {
            // eslint-disable-next-line no-console
            console.error("Object extends non-object", typeId);
            return [];
        }
        const extended = unwrapObjectType(unwrapped.shape, types);

        // merge the availability of the extended object with the availability of the properties
        extended.properties = extended.properties.map((property) => {
            return {
                ...property,
                availability: coalesceAvailability(
                    compact([typeDef?.availability, unwrapped.availability, property.availability]),
                ),
            };
        });

        descriptions.push(...extended.descriptions);

        if (!unwrapped.isOptional) {
            return extended.properties;
        }

        // if the extended object is optional, we need to make all properties optional
        return extended.properties.map((property): Latest.ObjectProperty => {
            // if a default value is present for the referenced object, we can find the default value for this property
            const defaultProperty = isPlainObject(unwrapped.default) ? unwrapped.default[property.key] : undefined;

            const valueShape: Latest.TypeReference.Optional =
                property.valueShape.type === "alias" && property.valueShape.value.type === "optional"
                    ? { ...property.valueShape.value, default: defaultProperty ?? property.valueShape.value.default }
                    : { type: "optional", shape: property.valueShape, default: defaultProperty };

            return {
                ...property,
                valueShape: { type: "alias", value: valueShape },
            };
        });
    });

    // TODO: for extended properties, we should check for duplicates, and merge them if necessary
    if (extendedProperties.length === 0) {
        // if there are no extended properties, we can just return the direct properties
        // required properties should come before optional properties
        // however, we do NOT sort the properties by key because the initial order of properties may be significant
        const properties = sortBy(
            [...directProperties],
            (property) => unwrapReference(property.valueShape, types)?.isOptional,
            (property) => AvailabilityOrder.indexOf(property.availability ?? Latest.Availability.Stable),
        );
        return { properties, descriptions };
    }
    const propertyKeys = new Set(object.properties.map((property) => property.key));
    const filteredExtendedProperties = extendedProperties.filter(
        (extendedProperty) => !propertyKeys.has(extendedProperty.key),
    );

    // required properties should come before optional properties
    // since there are extended properties, the initial order of properties are not significant, and we should sort by key
    const properties = sortBy(
        [...directProperties, ...filteredExtendedProperties],
        (property) => unwrapReference(property.valueShape, types)?.isOptional,
        (property) => AvailabilityOrder.indexOf(property.availability ?? Latest.Availability.Stable),
        (property) => property.key,
    );
    return { properties, descriptions };
}

/**
 * The discriminant of a discriminated union is converted to a literal type, *prepended* to the additional properties.
 */
export function unwrapDiscriminatedUnionVariant(
    union: Pick<Latest.DiscriminatedUnionType, "discriminant">,
    variant: Latest.DiscriminatedUnionVariant,
    types: Record<string, Latest.TypeDefinition>,
): UnwrappedObjectType {
    const { properties, descriptions } = unwrapObjectType(variant, types);
    return {
        properties: [
            {
                key: union.discriminant,
                valueShape: {
                    type: "alias",
                    value: { type: "literal", value: { type: "stringLiteral", value: variant.discriminantValue } },
                },

                // the description and availability of the discriminant should not be included here
                // because they are already included in the union variant itself
                description: undefined,
                availability: undefined,
            },
            ...properties,
        ],
        descriptions,
    };
}

function primitiveToDefault(shape: Latest.PrimitiveType): unknown | undefined {
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
    });
}
