import { visitDiscriminatedUnion } from "@fern-api/fdr-sdk";
import {
    ResolvedHttpRequestBodyShape,
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    dereferenceObjectProperties,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../../resolver/types";
import { PlaygroundFormStateBody } from "../types";

export function getDefaultValueForObjectProperties(
    properties: ResolvedObjectProperty[] = [],
    types: Record<string, ResolvedTypeDefinition>,
): Record<string, unknown> {
    return properties.reduce<Record<string, unknown>>((acc, property) => {
        const defaultValue = getDefaultValueForType(property.valueShape, types);
        if (defaultValue != null) {
            acc[property.key] = defaultValue;
        }
        return acc;
    }, {});
}

export function getDefaultValuesForBody(
    requestShape: ResolvedHttpRequestBodyShape | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundFormStateBody | undefined {
    if (requestShape == null) {
        return undefined;
    }
    return visitResolvedHttpRequestBodyShape<PlaygroundFormStateBody | undefined>(requestShape, {
        formData: () => ({ type: "form-data", value: {} }),
        bytes: () => ({ type: "octet-stream", value: undefined }),
        typeShape: (typeShape) => ({
            type: "json",
            value: getDefaultValueForType(typeShape, types),
        }),
    });
}

export function getDefaultValueForType(
    shape: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): unknown {
    return visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit<unknown>({
        object: (object) => getDefaultValueForObjectProperties(dereferenceObjectProperties(object, types), types),
        discriminatedUnion: (discriminatedUnion) => {
            const variant = discriminatedUnion.variants[0];

            if (variant == null) {
                return undefined;
            }

            return {
                ...getDefaultValueForObjectProperties(dereferenceObjectProperties(variant, types), types),
                [discriminatedUnion.discriminant]: variant.discriminantValue,
            };
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            const variant = undiscriminatedUnion.variants[0];
            if (variant == null) {
                return undefined;
            }
            return getDefaultValueForType(variant.shape, types);
        },
        // if enum.length === 1, select it, otherwise, we don't presume to select an incorrect enum.
        enum: (value) => (value.values.length === 1 ? value.values[0]?.value : null),
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<unknown>({
                string: () => "",
                boolean: () => false,
                integer: () => 0,
                uint: () => 0,
                uint64: () => 0,
                double: () => 0,
                long: () => 0,
                datetime: () => new Date().toISOString(),
                uuid: () => "",
                base64: () => "",
                date: () => new Date().toISOString(),
                bigInteger: () => "",
                _other: () => undefined,
            }),
        literal: (literal) => literal.value.value,
        optional: () => undefined,
        list: () => [],
        set: () => [],
        map: () => ({}),
        unknown: () => undefined,
        _other: () => undefined,
        alias: (alias) => getDefaultValueForType(alias.shape, types),
    });
}
