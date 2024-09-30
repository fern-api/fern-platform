import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { isPlainObject } from "@fern-ui/core-utils";
import {
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    dereferenceObjectProperties,
    unwrapReference,
} from "../../resolver/types";

export function matchesTypeReference(
    shape: ResolvedTypeShape,
    value: unknown,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit<boolean>({
        object: (object) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const propertyMap = new Map<string, ResolvedObjectProperty>();
            dereferenceObjectProperties(object, types).forEach((property) => propertyMap.set(property.key, property));
            return Object.keys(value).every((key) => {
                const property = propertyMap.get(key);
                if (property == null) {
                    return false;
                }
                return matchesTypeReference(property.valueShape, value[key], types);
            });
        },
        discriminatedUnion: (discriminatedUnion) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const discriminantValue = value[discriminatedUnion.discriminant];
            if (typeof discriminantValue !== "string") {
                return false;
            }

            return discriminatedUnion.variants.some((variant) => {
                if (variant.discriminantValue !== discriminantValue) {
                    return false;
                }

                const propertyMap = new Map<string, ResolvedObjectProperty>();
                dereferenceObjectProperties(variant, types).forEach((property) =>
                    propertyMap.set(property.key, property),
                );
                return Object.keys(value).every((key) => {
                    if (key === discriminatedUnion.discriminant) {
                        return true;
                    }
                    const property = propertyMap.get(key);
                    if (property == null) {
                        return false;
                    }
                    return matchesTypeReference(property.valueShape, value[key], types);
                });
            });
        },
        undiscriminatedUnion: (undiscriminatedUnion) =>
            undiscriminatedUnion.variants.some((variant) => matchesTypeReference(variant.shape, value, types)),
        enum: (enumType) => {
            if (typeof value !== "string") {
                return false;
            }
            return enumType.values.some((enumValue) => enumValue.value === value);
        },
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<boolean>({
                string: () => typeof value === "string",
                boolean: () => typeof value === "boolean",
                integer: () => typeof value === "number" && Number.isInteger(value),
                uint: () => typeof value === "number" && Number.isInteger(value) && value > 0,
                uint64: () => typeof value === "number" && Number.isInteger(value) && value > 0,
                double: () => typeof value === "number",
                long: () => typeof value === "number" && Number.isInteger(value),
                datetime: () => value instanceof Date,
                uuid: () => typeof value === "string",
                base64: () => typeof value === "string",
                date: () => value instanceof Date,
                bigInteger: () => typeof value === "string",
                _other: () => value == null,
            }),
        literal: (literal) => value === literal.value.value,
        optional: (optionalType) => value == null || matchesTypeReference(optionalType.shape, value, types),
        list: (listType) =>
            Array.isArray(value) && value.every((item) => matchesTypeReference(listType.shape, item, types)),
        set: (setType) =>
            Array.isArray(value) && value.every((item) => matchesTypeReference(setType.shape, item, types)),
        map: (MapTypeContextProvider) =>
            isPlainObject(value) &&
            Object.keys(value).every((key) =>
                matchesTypeReference(MapTypeContextProvider.valueShape, value[key], types),
            ),
        unknown: () => value == null,
        _other: () => value == null,
        alias: (reference) => matchesTypeReference(reference.shape, value, types),
    });
}
