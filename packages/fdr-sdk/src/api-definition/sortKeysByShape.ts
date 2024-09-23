import { keyBy, mapValues } from "lodash-es";
import type { APIV1UI } from "../client/types";
import { isPlainObject } from "../utils/isPlainObject";
import { visitDiscriminatedUnion } from "../utils/visitDiscriminatedUnion";
import { dereferenceObjectProperties } from "./dereference";
import { TypeShapeOrReference } from "./types";

function sortKeysBy(obj: Record<string, unknown>, order: string[]): Record<string, unknown> {
    return mapValues(
        keyBy(order, (key) => key),
        (key) => obj[key],
    );
}

export function sortKeysByShape(
    obj: unknown,
    shape: TypeShapeOrReference | APIV1UI.HttpRequestBodyShape | APIV1UI.HttpResponseBodyShape | null | undefined,
    types: Record<string, APIV1UI.TypeDefinition>,
): unknown {
    if ((!isPlainObject(obj) && !Array.isArray(obj)) || shape == null) {
        return obj;
    }
    return visitDiscriminatedUnion(shape, "type")._visit<unknown>({
        id: ({ value: id }) => sortKeysByShape(obj, types[id]?.shape, types),
        primitive: () => obj,
        literal: () => obj,
        optional: ({ itemShape }) => sortKeysByShape(obj, itemShape, types),
        list: ({ itemShape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, itemShape, types)) : obj),
        set: ({ itemShape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, itemShape, types)) : obj),
        map: ({ valueShape }) =>
            isPlainObject(obj) ? mapValues(obj, (value) => sortKeysByShape(value, valueShape, types)) : obj,
        unknown: () => obj,
        object: (object) => {
            const objectProperties = dereferenceObjectProperties(object, types);
            return isPlainObject(obj)
                ? mapValues(
                      sortKeysBy(
                          obj,
                          objectProperties.map((p) => p.key),
                      ),
                      (value, key) => {
                          const property = objectProperties.find((p) => p.key === key);
                          if (property == null) {
                              return value;
                          }
                          return sortKeysByShape(value, property?.valueShape, types);
                      },
                  )
                : obj;
        },
        undiscriminatedUnion: () => obj, // TODO: match variant and sort nested objects
        discriminatedUnion: ({ discriminant, variants }) => {
            if (!isPlainObject(obj)) {
                return obj;
            }
            const variant = obj[discriminant];
            if (variant == null) {
                return obj;
            }
            const variantShape = variants.find((v) => v.discriminantValue === variant);
            if (variantShape == null) {
                return obj;
            }
            const variantProperties = dereferenceObjectProperties(variantShape.additionalProperties, types);
            return mapValues(sortKeysBy(obj, [discriminant, ...variantProperties.map((p) => p.key)]), (value, key) => {
                if (key === discriminant) {
                    return value;
                }
                const property = variantProperties.find((p) => p.key === key);
                if (property == null) {
                    return value;
                }
                return sortKeysByShape(value, property.valueShape, types);
            });
        },
        enum: () => obj,
        reference: ({ value: typeRef }) => sortKeysByShape(obj, typeRef, types),
        formData: ({ fields }) => {
            if (!isPlainObject(obj)) {
                return obj;
            }

            return mapValues(
                sortKeysBy(
                    obj,
                    fields.map((p) => p.key),
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
                },
            );
        },
        bytes: () => obj,
        fileDownload: () => obj,
        streamingText: () => obj,
        alias: (value) => sortKeysByShape(obj, value.value, types),
        stream: () => obj,
        _other: () => obj,
    });
}

export function safeSortKeysByShape(
    value: unknown,
    shape: TypeShapeOrReference | APIV1UI.HttpRequestBodyShape | APIV1UI.HttpResponseBodyShape | null | undefined,
    types: Record<string, APIV1UI.TypeDefinition>,
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
