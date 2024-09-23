import sortBy from "lodash-es/sortBy";
import type { APIV1UI } from "../client/types";
import { unwrapReference } from "./unwrap";

/**
 * Dereferences extended objects and returns all properties of the object.
 * If an object extends another object, the properties of the extended object will be sorted alphabetically.
 * Additionally, required properties will come before optional properties.
 *
 * @param object to dereference
 * @param types from the API definition
 * @returns the properties of the object, including properties from extended objects
 */
export function dereferenceObjectProperties(
    object: APIV1UI.ObjectType,
    types: Record<string, APIV1UI.TypeDefinition>,
): APIV1UI.ObjectProperty[] {
    const directProperties = object.properties;
    const extendedProperties = object.extends.flatMap((typeId): APIV1UI.ObjectProperty[] => {
        const typeDef = types[typeId];
        const unwrapped = unwrapReference(typeDef?.shape, types);
        // TODO: should we be able to extend discriminated and undiscriminated unions?
        if (unwrapped?.shape.type !== "object") {
            // eslint-disable-next-line no-console
            console.error("Object extends non-object", typeId);
            return [];
        }
        const extended = dereferenceObjectProperties(unwrapped.shape, types);

        if (!unwrapped.isOptional) {
            return extended;
        }

        // if the extended object is optional, we need to make all properties optional
        return extended.map((property) => {
            if (property.valueShape.type !== "optional") {
                return { ...property, valueShape: { type: "optional", itemShape: property.valueShape } };
            } else {
                return property;
            }
        });
    });
    // TODO: for extended properties, we should check for duplicates, and merge them if necessary
    if (extendedProperties.length === 0) {
        // if there are no extended properties, we can just return the direct properties
        // required properties should come before optional properties
        // however, we do NOT sort the properties by key because the initial order of properties may be significant
        return sortBy(
            [...directProperties],
            (property) => unwrapReference(property.valueShape, types)?.isOptional,
            (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
        );
    }
    const propertyKeys = new Set(object.properties.map((property) => property.key));
    const filteredExtendedProperties = extendedProperties.filter(
        (extendedProperty) => !propertyKeys.has(extendedProperty.key),
    );

    // required properties should come before optional properties
    // since there are extended properties, the initial order of properties are not significant, and we should sort by key
    return sortBy(
        [...directProperties, ...filteredExtendedProperties],
        (property) => unwrapReference(property.valueShape, types)?.isOptional,
        (property) => (property.availability === "Deprecated" ? 2 : property.availability === "Beta" ? 1 : 0),
        (property) => property.key,
    );
}

/**
 * The discriminant of a discriminated union is converted to a literal type, prepended to the additional properties.
 */
export function dereferenceDiscriminatedUnionVariant(
    union: APIV1UI.DiscriminatedUnionType,
    variant: APIV1UI.DiscriminatedUnionVariant,
    types: Record<string, APIV1UI.TypeDefinition>,
): APIV1UI.ObjectProperty[] {
    return [
        {
            key: union.discriminant,
            valueShape: { type: "literal", value: { type: "stringLiteral", value: variant.discriminantValue } },
        },
        ...dereferenceObjectProperties(variant.additionalProperties, types),
    ];
}
