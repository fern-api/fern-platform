import {
    HttpRequestBodyShape,
    TypeDefinition,
    TypeShapeOrReference,
    unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";

export function castToRecord(value: unknown): Record<string, unknown> {
    if (!isPlainObject(value)) {
        return {};
    }
    return value;
}

export function isExpandable(
    valueShape: TypeShapeOrReference,
    currentValue: unknown,
    types: Record<string, TypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(unwrapReference(valueShape, types).shape, "type")._visit<boolean>({
        object: () => false,
        discriminatedUnion: () => false,
        undiscriminatedUnion: () => false,
        enum: () => false,
        list: () => Array.isArray(currentValue) && currentValue.length > 0,
        set: () => Array.isArray(currentValue) && currentValue.length > 0,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 0,
        unknown: () => false,
        _other: () => false,
        primitive: () => false,
        literal: () => false,
    });
}

export function hasRequiredFields(bodyShape: HttpRequestBodyShape, types: Record<string, TypeDefinition>): boolean {
    return visitHttpRequestBodyShape(bodyShape, {
        formData: (formData) =>
            formData.properties.some((property) =>
                visitDiscriminatedUnion(property, "type")._visit<boolean>({
                    file: (file) => !file.isOptional,
                    fileArray: (fileArray) => !fileArray.isOptional,
                    bodyProperty: (bodyProperty) => hasRequiredFields(bodyProperty.valueShape, types),
                    _other: () => false,
                }),
            ) ?? true,
        bytes: (bytes) => !bytes.isOptional,
        typeShape: (shape) =>
            visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit({
                primitive: () => true,
                literal: () => true,
                object: (object) =>
                    dereferenceObjectProperties(object, types).some((property) =>
                        hasRequiredFields(property.valueShape, types),
                    ),
                undiscriminatedUnion: () => true,
                discriminatedUnion: () => true,
                enum: () => true,
                optional: () => false,
                list: () => true,
                set: () => true,
                map: () => true,
                unknown: () => true,
                alias: (alias) => hasRequiredFields(alias.shape, types),
                _other: () => true,
            }),
    });
}

export function hasOptionalFields(bodyShape: HttpRequestBodyShape, types: Record<string, TypeDefinition>): boolean {
    return visitHttpRequestBodyShape(bodyShape, {
        formData: (formData) =>
            formData.properties.some((property) =>
                visitDiscriminatedUnion(property, "type")._visit<boolean>({
                    file: (file) => file.isOptional,
                    fileArray: (fileArray) => fileArray.isOptional,
                    bodyProperty: (bodyProperty) => hasOptionalFields(bodyProperty.valueShape, types),
                    _other: () => false,
                }),
            ) ?? false,
        bytes: (bytes) => bytes.isOptional,
        typeShape: (shape) =>
            visitDiscriminatedUnion(unwrapReference(shape, types), "type")._visit({
                primitive: () => false,
                literal: () => false,
                object: (object) =>
                    dereferenceObjectProperties(object, types).some((property) =>
                        hasOptionalFields(property.valueShape, types),
                    ),
                undiscriminatedUnion: () => false,
                discriminatedUnion: () => false,
                enum: () => false,
                optional: () => true,
                list: () => false,
                set: () => false,
                map: () => false,
                unknown: () => false,
                alias: (alias) => hasOptionalFields(alias.shape, types),
                _other: () => false,
            }),
    });
}

export const ENUM_RADIO_BREAKPOINT = 5;

export function shouldRenderInline(
    typeReference: TypeShapeOrReference,
    types: Record<string, TypeDefinition>,
): boolean {
    const unwrapped = unwrapReference(typeReference, types);
    if (unwrapped.isOptional) {
        return false;
    }
    return visitDiscriminatedUnion(unwrapped.shape, "type")._visit({
        primitive: () => true,
        literal: () => true,
        object: () => false,
        map: () => false,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: (_enum) => true,
        list: () => false,
        set: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
