import {
  HttpRequestBodyShape,
  ObjectProperty,
  TypeDefinition,
  TypeShapeOrReference,
  unwrapDiscriminatedUnionVariant,
  unwrapObjectType,
  unwrapReference,
} from "@fern-api/fdr-sdk/api-definition";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { PlaygroundFormStateBody } from "../types";

export function getEmptyValueForObjectProperties(
  properties: ObjectProperty[] = [],
  types: Record<string, TypeDefinition>
): Record<string, unknown> {
  return properties.reduce<Record<string, unknown>>((acc, property) => {
    const defaultValue = getEmptyValueForType(property.valueShape, types);
    if (defaultValue != null) {
      acc[property.key] = defaultValue;
    }
    return acc;
  }, {});
}

export function getEmptyValueForHttpRequestBody(
  requestShape: HttpRequestBodyShape | undefined,
  types: Record<string, TypeDefinition>
): PlaygroundFormStateBody | undefined {
  if (requestShape == null) {
    return undefined;
  }
  return visitDiscriminatedUnion(requestShape)._visit<
    PlaygroundFormStateBody | undefined
  >({
    object: (value) => ({
      type: "json",
      value: getEmptyValueForType(value, types),
    }),
    alias: (value) => ({
      type: "json",
      value: getEmptyValueForType(value, types),
    }),
    bytes: () => ({ type: "octet-stream", value: undefined }),
    formData: () => ({ type: "form-data", value: {} }),
  });
}

export function getEmptyValueForType(
  shape: TypeShapeOrReference,
  types: Record<string, TypeDefinition>
): unknown {
  const unwrapped = unwrapReference(shape, types);

  if (unwrapped.isOptional) {
    return undefined;
  }

  return visitDiscriminatedUnion(unwrapped.shape)._visit<unknown>({
    object: (object) =>
      getEmptyValueForObjectProperties(
        unwrapObjectType(object, types).properties,
        types
      ),
    discriminatedUnion: (discriminatedUnion) => {
      const variant = discriminatedUnion.variants[0];

      if (variant == null) {
        return undefined;
      }

      return {
        ...getEmptyValueForObjectProperties(
          unwrapDiscriminatedUnionVariant(discriminatedUnion, variant, types)
            .properties,
          types
        ),
        [discriminatedUnion.discriminant]: variant.discriminantValue,
      };
    },
    undiscriminatedUnion: (undiscriminatedUnion) => {
      const variant = undiscriminatedUnion.variants[0];
      if (variant == null) {
        return undefined;
      }
      return getEmptyValueForType(variant.shape, types);
    },
    // if enum.length === 1, select it, otherwise, we don't presume to select an incorrect enum.
    enum: (value) =>
      value.default ??
      (value.values.length === 1 ? value.values[0]?.value : null),
    primitive: (primitive) =>
      visitDiscriminatedUnion(primitive.value, "type")._visit<unknown>({
        string: (value) => value.default ?? "",
        boolean: (value) => value.default ?? false,
        integer: (value) => value.default ?? 0,
        uint: () => 0,
        uint64: () => 0,
        double: (value) => value.default ?? 0,
        long: (value) => value.default ?? 0,
        datetime: (value) => value.default ?? new Date().toISOString(),
        uuid: (value) => value.default ?? "",
        base64: (value) => value.default ?? "",
        date: (value) => value.default ?? new Date().toISOString(),
        bigInteger: (value) => value.default ?? "",
        _other: () => undefined,
      }),
    literal: (literal) => literal.value.value,
    list: () => [],
    set: () => [],
    map: () => ({}),
    unknown: () => undefined,
  });
}
