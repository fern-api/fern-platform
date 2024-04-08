import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { keyBy, mapValues } from "lodash-es";
import {
    dereferenceObjectProperties,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
} from "../../util/resolver";

function sortKeysBy(obj: Record<string, unknown>, order: string[]) {
    // return keyBy(
    //     map(order, function (key) {
    //         return obj[key];
    //     }),
    //     order,
    // );
    return mapValues(
        keyBy(order, (key) => key),
        (key) => obj[key],
    );
}

export function sortKeysByShape(
    obj: unknown,
    shape: ResolvedTypeShape | ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape | null | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): unknown {
    if ((!isPlainObject(obj) && !Array.isArray(obj)) || shape == null) {
        return obj;
    }
    return visitDiscriminatedUnion(shape, "type")._visit<unknown>({
        string: () => obj,
        boolean: () => obj,
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
                          return sortKeysByShape(value, property.valueShape, types);
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
            const variantProperties = dereferenceObjectProperties(variantShape, types);
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
        integer: () => obj,
        double: () => obj,
        long: () => obj,
        datetime: () => obj,
        uuid: () => obj,
        base64: () => obj,
        date: () => obj,
        optional: ({ shape }) => sortKeysByShape(obj, shape, types),
        list: ({ shape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, shape, types)) : obj),
        set: ({ shape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, shape, types)) : obj),
        map: ({ valueShape }) =>
            isPlainObject(obj) ? mapValues(obj, (value) => sortKeysByShape(value, valueShape, types)) : obj,
        booleanLiteral: () => obj,
        stringLiteral: () => obj,
        unknown: () => obj,
        reference: ({ typeId }) => sortKeysByShape(obj, types[typeId], types),
        fileUpload: ({ value }) => {
            if (value == null || !isPlainObject(obj)) {
                return obj;
            }

            return mapValues(
                sortKeysBy(
                    obj,
                    value.properties.map((p) => p.key),
                ),
                (v, key) => {
                    const property = value.properties.find((p) => p.key === key);

                    if (property == null) {
                        return v;
                    }

                    if (property.type === "bodyProperty") {
                        return sortKeysByShape(v, property.valueShape, types);
                    }

                    return undefined;
                },
            );
        },
        bytes: () => obj,
        fileDownload: () => obj,
        streamCondition: () => obj,
        streamingText: () => obj,
        alias: ({ shape }) => sortKeysByShape(obj, shape, types),
        stream: () => obj,
        _other: () => obj,
    });
}
