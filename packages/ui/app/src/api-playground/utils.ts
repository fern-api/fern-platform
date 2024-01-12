import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty } from "lodash-es";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { ApiPlaygroundFormState } from "./types";

export function unknownToString(value: unknown): string {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    if (typeof value === "number") {
        return value.toString();
    }
    if (value == null) {
        return "";
    }
    return JSON.stringify(value);
}

export function castToRecord(value: unknown): Record<string, unknown> {
    if (!isPlainObject(value)) {
        return {};
    }
    return value;
}

export function buildQueryParams(queryParameters: Record<string, unknown>): string {
    const queryParams = new URLSearchParams();
    Object.entries(queryParameters).forEach(([key, value]) => {
        queryParams.set(key, unknownToString(value));
    });
    return queryParams.size > 0 ? "?" + queryParams.toString() : "";
}

export function buildUrl(endpoint: APIV1Read.EndpointDefinition, formState: ApiPlaygroundFormState): string {
    return (
        endpoint.environments[0]?.baseUrl +
        endpoint.path.parts
            .map((part) => {
                if (part.type === "pathParameter") {
                    const stateValue = unknownToString(formState.pathParameters[part.value]);
                    return stateValue.length > 0 ? encodeURI(stateValue) : ":" + part.value;
                }
                return part.value;
            })
            .join("") +
        buildQueryParams(formState.queryParameters)
    );
}

export function indentAfter(str: string, indent: number, afterLine?: number): string {
    return str
        .split("\n")
        .map((line, idx) => {
            if (afterLine == null || idx > afterLine) {
                return " ".repeat(indent) + line;
            }
            return line;
        })
        .join("\n");
}

export function stringifyFetch(endpoint: APIV1Read.EndpointDefinition, formState: ApiPlaygroundFormState): string {
    return `// ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
const response = fetch("${buildUrl(endpoint, formState)}", {
    method: "${endpoint.method}",
    headers: ${JSON.stringify(
        redactAuthorizationHeader(
            Object.entries(formState.headers).reduce<Record<string, string>>((acc, [key, value]) => {
                if (typeof value === "string") {
                    acc[key] = value;
                }
                return acc;
            }, {})
        ),
        undefined,
        2
    )},${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? `\n    body: JSON.stringify(${indentAfter(JSON.stringify(formState.body, undefined, 2), 4, 0)}),`
            : ""
    }
});

const body = await response.json();
console.log(body);`;
}

export function stringifyPythonRequests(
    endpoint: APIV1Read.EndpointDefinition,
    formState: ApiPlaygroundFormState
): string {
    return `import requests

# ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
response = requests.${endpoint.method.toLowerCase()}(
    "${buildUrl(endpoint, formState)}",
    headers=${JSON.stringify(
        redactAuthorizationHeader(
            Object.entries(formState.headers).reduce<Record<string, string>>((acc, [key, value]) => {
                if (typeof value === "string") {
                    acc[key] = value;
                }
                return acc;
            }, {})
        ),
        undefined,
        2
    )},${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? `\n    json=${indentAfter(JSON.stringify(formState.body, undefined, 2), 4, 0)},`
            : ""
    }
)

print(response.json())`;
}

export function redactAuthorizationHeader(headers: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(headers).map(([key, value]) => {
            if (key.toLowerCase() === "authorization") {
                return [key, value];
            }
            return [key, value];
        })
    );
}

export function stringifyCurl(endpoint: APIV1Read.EndpointDefinition, formState: ApiPlaygroundFormState): string {
    const headers: Record<string, string> = {};
    if (endpoint.authed && formState.headers["Authorization"] != null) {
        headers["Authorization"] = formState.headers["Authorization"] as string;
    }
    if (endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }
    Object.entries(formState.headers).forEach(([key, value]) => {
        if (typeof value === "string") {
            headers[key] = value;
        }
    });
    return `curl -X ${endpoint.method} "${buildUrl(endpoint, formState)}"${Object.entries(
        redactAuthorizationHeader(headers)
    )
        .map(([key, value]) => ` \\\n     -H "${key}: ${value}"`)
        .join(" \\\n     ")}${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? ` \\\n     -d '${JSON.stringify(formState.body, undefined, 2)}'`
            : ""
    }
`;
}

export function getDefaultValueForObject(
    object: APIV1Read.ObjectType,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): Record<string, unknown> {
    return getAllObjectProperties(object, resolveTypeById).reduce<Record<string, unknown>>((acc, property) => {
        acc[property.key] = getDefaultValueForType(property.valueType, resolveTypeById);
        return acc;
    }, {});
}

export function matchesTypeShape(
    shape: APIV1Read.TypeShape,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    value: unknown
): boolean {
    return visitDiscriminatedUnion(shape, "type")._visit<boolean>({
        object: (object) => {
            if (!isPlainObject(value)) {
                return false;
            }
            const properties = getAllObjectProperties(object, resolveTypeById);
            return Object.keys(properties).every((key) => {
                const property = properties.find((property) => property.key === key);
                if (property == null) {
                    return false;
                }
                return matchesTypeReference(property.valueType, resolveTypeById, value[key]);
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

                const mockedObjectTypeReference: APIV1Read.TypeShape = {
                    type: "object",
                    extends: variant.additionalProperties.extends,
                    properties: [
                        ...variant.additionalProperties.properties,
                        {
                            key: discriminatedUnion.discriminant,
                            valueType: {
                                type: "literal",
                                value: {
                                    type: "stringLiteral",
                                    value: discriminantValue,
                                },
                            },
                        },
                    ],
                };

                return matchesTypeShape(mockedObjectTypeReference, resolveTypeById, value);
            });
        },
        undiscriminatedUnion: (undiscriminatedUnion) => {
            if (!isPlainObject(value)) {
                return false;
            }
            return undiscriminatedUnion.variants.some((variant) =>
                matchesTypeReference(variant.type, resolveTypeById, value)
            );
        },
        alias: (alias) => matchesTypeReference(alias.value, resolveTypeById, value),
        enum: (enumType) => {
            if (typeof value !== "string") {
                return false;
            }
            return enumType.values.some((enumValue) => enumValue.value === value);
        },
        _other: () => value == null,
    });
}

export function matchesTypeReference(
    type: APIV1Read.TypeReference,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined,
    value: unknown
): boolean {
    return visitDiscriminatedUnion(type, "type")._visit<boolean>({
        id: (id) => {
            const typeDefinition = resolveTypeById(id.value);
            if (typeDefinition == null) {
                return value == null;
            }
            return matchesTypeShape(typeDefinition.shape, resolveTypeById, value);
        },
        primitive: (primitive) => {
            return visitDiscriminatedUnion(primitive.value, "type")._visit<boolean>({
                string: () => typeof value === "string",
                boolean: () => typeof value === "boolean",
                integer: () => typeof value === "number" && Number.isInteger(value),
                double: () => typeof value === "number",
                long: () => typeof value === "number" && Number.isInteger(value),
                datetime: () => value instanceof Date,
                uuid: () => typeof value === "string",
                base64: () => typeof value === "string",
                date: () => value instanceof Date,
                _other: () => value == null,
            });
        },
        optional: (optionalType) =>
            value == null || matchesTypeReference(optionalType.itemType, resolveTypeById, value),
        list: (listType) =>
            Array.isArray(value) &&
            value.every((item) => matchesTypeReference(listType.itemType, resolveTypeById, item)),
        set: (setType) =>
            Array.isArray(value) &&
            value.every((item) => matchesTypeReference(setType.itemType, resolveTypeById, item)),
        map: (MapTypeContextProvider) =>
            isPlainObject(value) &&
            Object.keys(value).every((key) =>
                matchesTypeReference(MapTypeContextProvider.valueType, resolveTypeById, value[key])
            ),
        literal: (literalType) => value === literalType.value.value,
        unknown: () => value == null,
        _other: () => value == null,
    });
}

export function getDefaultValueForTypes(
    types: Array<{
        key: string;
        type: APIV1Read.TypeReference;
    }>,
    resolveTypeById: (typeId: string) => APIV1Read.TypeDefinition | undefined
): Record<string, unknown> {
    return types.reduce<Record<string, unknown>>((acc, { key, type }) => {
        acc[key] = getDefaultValueForType(type, resolveTypeById);
        return acc;
    }, {});
}

export function getDefaultValuesForBody(
    requestShape: APIV1Read.HttpRequestBodyShape | undefined,
    resolveTypeById: (typeId: string) => APIV1Read.TypeDefinition | undefined
): unknown {
    return requestShape != null
        ? visitDiscriminatedUnion(requestShape, "type")._visit({
              object: (o) => getDefaultValueForObject(o, resolveTypeById),
              reference: (reference) => getDefaultValueForType(reference.value, resolveTypeById),
              fileUpload: () => null,
              _other: () => null,
          })
        : {};
}

export function getDefaultValueForType(
    type: APIV1Read.TypeReference,
    resolveTypeById: (typeId: APIV1Read.TypeId) => APIV1Read.TypeDefinition | undefined
): unknown {
    return visitDiscriminatedUnion(type, "type")._visit({
        id: (id) => {
            const typeDefinition = resolveTypeById(id.value);
            if (typeDefinition == null) {
                return null;
            }
            return visitDiscriminatedUnion(typeDefinition.shape, "type")._visit({
                object: (object) => getDefaultValueForObject(object, resolveTypeById),
                discriminatedUnion: (discriminatedUnion) => {
                    const variant = discriminatedUnion.variants[0];

                    if (variant == null) {
                        return null;
                    }

                    const variantProperties = getAllObjectProperties(variant.additionalProperties, resolveTypeById);

                    return variantProperties.reduce<Record<string, unknown>>(
                        (acc, property) => {
                            acc[property.key] = getDefaultValueForType(property.valueType, resolveTypeById);
                            return acc;
                        },
                        {
                            [discriminatedUnion.discriminant]: variant.discriminantValue,
                        }
                    );
                },
                undiscriminatedUnion: (undiscriminatedUnion) => {
                    const variant = undiscriminatedUnion.variants[0];
                    if (variant == null) {
                        return null;
                    }
                    return getDefaultValueForType(variant.type, resolveTypeById);
                },
                alias: (alias) => getDefaultValueForType(alias.value, resolveTypeById),
                enum: (value) => value.values[0]?.value,
                _other: () => null,
            });
        },
        primitive: (primitive) =>
            visitDiscriminatedUnion(primitive.value, "type")._visit<unknown>({
                string: () => "",
                boolean: () => false,
                integer: () => 0,
                double: () => 0,
                long: () => 0,
                datetime: () => new Date().toISOString(),
                uuid: () => "",
                base64: () => "",
                date: () => new Date().toISOString(),
                _other: () => null,
            }),
        optional: () => undefined,
        list: () => [],
        set: () => [],
        map: () => ({}),
        literal: (literal) => literal.value.value,
        unknown: () => null,
        _other: () => null,
    });
}

export function isExpandable(
    valueType: APIV1Read.TypeReference,
    resolveTypeById: (typeId: string) => APIV1Read.TypeDefinition | undefined,
    currentValue: unknown
): boolean {
    return visitDiscriminatedUnion(valueType, "type")._visit<boolean>({
        id: (id) => {
            const typeShape = resolveTypeById(id.value)?.shape;
            if (typeShape == null) {
                return false;
            }
            return visitDiscriminatedUnion(typeShape, "type")._visit<boolean>({
                object: () => true,
                discriminatedUnion: () => true,
                undiscriminatedUnion: () => true,
                alias: (alias) => isExpandable(alias.value, resolveTypeById, currentValue),
                enum: () => false,
                _other: () => false,
            });
        },
        primitive: () => false,
        optional: (optional) => isExpandable(optional.itemType, resolveTypeById, currentValue),
        list: () => Array.isArray(currentValue) && currentValue.length > 1,
        set: () => Array.isArray(currentValue) && currentValue.length > 1,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 1,
        literal: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
