import isPlainObject from "@fern-api/ui-core-utils/isPlainObject";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { difference, keyBy } from "es-toolkit/array";
import { mapValues } from "es-toolkit/object";
import type * as Latest from "./latest";
import { TypeShapeOrReference } from "./types";
import { unwrapDiscriminatedUnionVariant, unwrapObjectType } from "./unwrap";

function sortKeysBy(
  obj: Record<string, unknown>,
  order: string[]
): Record<string, unknown> {
  return mapValues(
    // difference() is used to ensure that all keys are included in the result
    keyBy([...order, ...difference(Object.keys(obj), order)], (key) => key),
    (key) => obj[key]
  );
}

export function sortKeysByShape(
  obj: unknown,
  shape:
    | TypeShapeOrReference
    | Latest.HttpRequestBodyShape
    | Latest.HttpResponseBodyShape
    | null
    | undefined,
  types: Record<string, Latest.TypeDefinition>
): unknown {
  if ((!isPlainObject(obj) && !Array.isArray(obj)) || shape == null) {
    return obj;
  }
  return visitDiscriminatedUnion(shape, "type")._visit<unknown>({
    id: ({ id }) => sortKeysByShape(obj, types[id]?.shape, types),
    primitive: () => obj,
    literal: () => obj,
    optional: ({ shape }) => sortKeysByShape(obj, shape, types),
    list: ({ itemShape }) =>
      Array.isArray(obj)
        ? obj.map((o) => sortKeysByShape(o, itemShape, types))
        : obj,
    set: ({ itemShape }) =>
      Array.isArray(obj)
        ? obj.map((o) => sortKeysByShape(o, itemShape, types))
        : obj,
    map: ({ valueShape }) =>
      isPlainObject(obj)
        ? mapValues(obj, (value) => sortKeysByShape(value, valueShape, types))
        : obj,
    unknown: () => obj,
    object: (object) => {
      const objectProperties = unwrapObjectType(object, types).properties;
      return isPlainObject(obj)
        ? mapValues(
            sortKeysBy(
              obj,
              objectProperties.map((p) => p.key)
            ),
            (value, key) => {
              const property = objectProperties.find((p) => p.key === key);
              if (property == null) {
                return value;
              }
              return sortKeysByShape(value, property?.valueShape, types);
            }
          )
        : obj;
    },
    undiscriminatedUnion: () => obj, // TODO: match variant and sort nested objects
    discriminatedUnion: (union) => {
      const { discriminant, variants } = union;
      if (!isPlainObject(obj)) {
        return obj;
      }
      const variant = obj[discriminant];
      if (variant == null) {
        return obj;
      }
      const variantShape = variants.find(
        (v) => v.discriminantValue === variant
      );
      if (variantShape == null) {
        return obj;
      }
      const variantProperties = unwrapDiscriminatedUnionVariant(
        union,
        variantShape,
        types
      ).properties;
      return mapValues(
        sortKeysBy(obj, [discriminant, ...variantProperties.map((p) => p.key)]),
        (value, key) => {
          if (key === discriminant) {
            return value;
          }
          const property = variantProperties.find((p) => p.key === key);
          if (property == null) {
            return value;
          }
          return sortKeysByShape(value, property.valueShape, types);
        }
      );
    },
    enum: () => obj,
    alias: ({ value: typeRef }) => sortKeysByShape(obj, typeRef, types),
    formData: ({ fields }) => {
      if (!isPlainObject(obj)) {
        return obj;
      }

      return mapValues(
        sortKeysBy(
          obj,
          fields.map((p) => p.key)
        ),
        (v, key) => {
          const property = fields.find((p) => p.key === key);

          if (property == null) {
            return v;
          }

          if (property.type === "property") {
            return sortKeysByShape(v, property.valueShape, types);
          }

          return undefined;
        }
      );
    },
    bytes: () => obj,
    fileDownload: () => obj,
    streamingText: () => obj,
    stream: () => obj,
    _other: () => obj,
  });
}

export function safeSortKeysByShape(
  value: unknown,
  shape:
    | TypeShapeOrReference
    | Latest.HttpRequestBodyShape
    | Latest.HttpResponseBodyShape
    | null
    | undefined,
  types: Record<string, Latest.TypeDefinition>
): unknown {
  if (value == null) {
    return value;
  }
  try {
    return stripUndefines(sortKeysByShape(value, shape, types));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("Failed to sort JSON keys by type shape", e);

    return value;
  }
}

function stripUndefines(obj: unknown): unknown {
  return JSON.parse(JSON.stringify(obj));
}
