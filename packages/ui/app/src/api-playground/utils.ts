import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty, noop } from "lodash-es";
import { getAllObjectProperties } from "../api-page/utils/getAllObjectProperties";
import { PlaygroundRequestFormState } from "./types";

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

export function buildQueryParams(queryParameters: Record<string, unknown> | undefined): string {
    if (queryParameters == null) {
        return "";
    }
    const queryParams = new URLSearchParams();
    Object.entries(queryParameters).forEach(([key, value]) => {
        queryParams.set(key, unknownToString(value));
    });
    return queryParams.size > 0 ? "?" + queryParams.toString() : "";
}

export function buildUrl(
    endpoint: APIV1Read.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined
): string {
    if (endpoint == null) {
        return "";
    }
    return (
        endpoint.environments[0]?.baseUrl +
        endpoint.path.parts
            .map((part) => {
                if (part.type === "pathParameter") {
                    const stateValue = unknownToString(formState?.pathParameters[part.value]);
                    return stateValue.length > 0 ? encodeURI(stateValue) : ":" + part.value;
                }
                return part.value;
            })
            .join("") +
        buildQueryParams(formState?.queryParameters)
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

export function stringifyFetch(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState,
    redacted = true
): string {
    if (endpoint == null) {
        return "";
    }
    const headers = redacted
        ? buildRedactedHeaders(auth, endpoint, formState)
        : buildUnredactedHeaders(auth, endpoint, formState);
    return `// ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
const response = fetch("${buildUrl(endpoint, formState)}", {
  method: "${endpoint.method}",
  headers: ${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? `\n  body: JSON.stringify(${indentAfter(JSON.stringify(formState.body, undefined, 2), 2, 0)}),`
            : ""
    }
});

const body = await response.json();
console.log(body);`;
}

export function stringifyPythonRequests(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState,
    redacted = true
): string {
    if (endpoint == null) {
        return "";
    }
    const headers = redacted
        ? buildRedactedHeaders(auth, endpoint, formState)
        : buildUnredactedHeaders(auth, endpoint, formState);
    return `import requests

# ${endpoint.name} (${endpoint.method} ${endpoint.path.parts
        .map((part) => (part.type === "literal" ? part.value : `:${part.value}`))
        .join("")})
response = requests.${endpoint.method.toLowerCase()}(
  "${buildUrl(endpoint, formState)}",
  headers=${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? `\n  json=${indentAfter(JSON.stringify(formState.body, undefined, 2), 2, 0)},`
            : ""
    }
)

print(response.json())`;
}

export function obfuscateSecret(secret: string): string {
    if (secret.trimEnd().length === 0) {
        return secret;
    }
    if (secret.length < 28) {
        return secret.slice(0, 1) + "*".repeat(25) + secret.slice(-2);
    }
    return secret.slice(0, 12) + "...." + secret.slice(-12);
}

function buildRedactedHeaders(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition,
    formState: PlaygroundRequestFormState
): Record<string, string> {
    const headers: Record<string, string> = {};
    endpoint.headers.forEach((header) => {
        if (formState.headers[header.key] != null) {
            headers[header.key] = unknownToString(formState.headers[header.key]);
        }
    });

    if (endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }

    if (auth != null && endpoint.authed && formState.auth != null) {
        visitDiscriminatedUnion(formState.auth, "type")._visit({
            bearerAuth: (bearerAuth) => {
                if (auth.type === "bearerAuth") {
                    headers["Authorization"] = `Bearer ${obfuscateSecret(bearerAuth.token)}`;
                }
            },
            header: (header) => {
                if (auth.type === "header") {
                    const value = header.headers[auth.headerWireValue];
                    if (value != null) {
                        headers[auth.headerWireValue] = obfuscateSecret(value);
                    }
                }
            },
            basicAuth: (basicAuth) => {
                if (auth.type === "basicAuth") {
                    headers["Authorization"] = `Basic ${btoa(
                        `${basicAuth.username}:${obfuscateSecret(basicAuth.password)}`
                    )}`;
                }
            },
            _other: noop,
        });
    }

    return headers;
}

export function buildUnredactedHeaders(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined
): Record<string, string> {
    const headers: Record<string, string> = {};
    if (endpoint == null) {
        return headers;
    }
    endpoint.headers.forEach((header) => {
        if (formState?.headers[header.key] != null) {
            headers[header.key] = unknownToString(formState.headers[header.key]);
        }
    });

    if (endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request.contentType;
    }

    if (auth != null && endpoint.authed && formState?.auth != null) {
        visitDiscriminatedUnion(formState?.auth, "type")._visit({
            bearerAuth: (bearerAuth) => {
                if (auth.type === "bearerAuth") {
                    headers["Authorization"] = `Bearer ${bearerAuth.token}`;
                }
            },
            header: (header) => {
                if (auth.type === "header") {
                    const value = header.headers[auth.headerWireValue];
                    if (value != null) {
                        headers[auth.headerWireValue] = value;
                    }
                }
            },
            basicAuth: (basicAuth) => {
                if (auth.type === "basicAuth") {
                    headers["Authorization"] = `Basic ${btoa(`${basicAuth.username}:${basicAuth.password}`)}`;
                }
            },
            _other: noop,
        });
    }

    return headers;
}

export function stringifyCurl(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: APIV1Read.EndpointDefinition | undefined,
    formState: PlaygroundRequestFormState,
    redacted = true
): string {
    if (endpoint == null) {
        return "";
    }
    const headers = redacted
        ? buildRedactedHeaders(auth, endpoint, formState)
        : buildUnredactedHeaders(auth, endpoint, formState);
    return `curl -X ${endpoint.method} "${buildUrl(endpoint, formState)}"${Object.entries(headers)
        .map(([key, value]) => ` \\\n     -H "${key}: ${value}"`)
        .join("")}${
        endpoint.request?.contentType === "application/json" &&
        !isEmpty(formState.body) &&
        endpoint.request.type.type !== "fileUpload"
            ? ` \\\n     -d '${
                  redacted
                      ? JSON.stringify(formState.body, undefined, 2)
                      : JSON.stringify(JSON.stringify(formState.body))
              }'`
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
    types:
        | Array<{
              key: string;
              type: APIV1Read.TypeReference;
          }>
        | undefined,
    resolveTypeById: (typeId: string) => APIV1Read.TypeDefinition | undefined
): Record<string, unknown> {
    if (types == null) {
        return {};
    }
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
                return undefined;
            }
            return visitDiscriminatedUnion(typeDefinition.shape, "type")._visit({
                object: (object) => getDefaultValueForObject(object, resolveTypeById),
                discriminatedUnion: (discriminatedUnion) => {
                    const variant = discriminatedUnion.variants[0];

                    if (variant == null) {
                        return undefined;
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
                        return undefined;
                    }
                    return getDefaultValueForType(variant.type, resolveTypeById);
                },
                alias: (alias) => getDefaultValueForType(alias.value, resolveTypeById),
                // if enum.length === 1, select it, otherwise, we don't presume to select an incorrect enum.
                enum: (value) => (value.values.length === 1 ? value.values[0]?.value : null),
                _other: () => undefined,
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
                _other: () => undefined,
            }),
        optional: () => undefined,
        list: () => [],
        set: () => [],
        map: () => ({}),
        literal: (literal) => literal.value.value,
        unknown: () => undefined,
        _other: () => undefined,
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
                object: () => false,
                discriminatedUnion: () => false,
                undiscriminatedUnion: () => false,
                alias: (alias) => isExpandable(alias.value, resolveTypeById, currentValue),
                enum: () => false,
                _other: () => false,
            });
        },
        primitive: () => false,
        optional: (optional) => isExpandable(optional.itemType, resolveTypeById, currentValue),
        list: () => Array.isArray(currentValue) && currentValue.length > 0,
        set: () => Array.isArray(currentValue) && currentValue.length > 0,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 0,
        literal: () => false,
        unknown: () => false,
        _other: () => false,
    });
}
