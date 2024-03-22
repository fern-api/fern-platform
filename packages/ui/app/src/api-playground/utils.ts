import { isNonNullish, isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { isEmpty, mapValues, noop } from "lodash-es";
import { stringifyHttpRequestExampleToCurl } from "../api-page/examples/types";
import {
    dereferenceObjectProperties,
    ResolvedEndpointDefinition,
    ResolvedEndpointPathParts,
    ResolvedExampleEndpointRequest,
    ResolvedFormValue,
    ResolvedHttpRequestBodyShape,
    ResolvedObjectProperty,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    unwrapReference,
    visitResolvedHttpRequestBodyShape,
} from "../util/resolver";
import {
    convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest,
    PlaygroundEndpointRequestFormState,
    PlaygroundFormDataEntryValue,
    PlaygroundFormStateBody,
    PlaygroundRequestFormState,
} from "./types";

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

function buildPath(path: ResolvedEndpointPathParts[], pathParameters?: Record<string, unknown>): string {
    return path
        .map((part) => {
            if (part.type === "pathParameter") {
                const stateValue = unknownToString(pathParameters?.[part.key]);
                return stateValue.length > 0 ? encodeURI(stateValue) : ":" + part.key;
            }
            return part.value;
        })
        .join("");
}

export function buildRequestUrl(
    baseUrl: string = "",
    path: ResolvedEndpointPathParts[] = [],
    pathParameters: Record<string, unknown> = {},
    queryParameters: Record<string, unknown> = {},
): string {
    return baseUrl + buildPath(path, pathParameters) + buildQueryParams(queryParameters);
}

export function buildEndpointUrl(
    endpoint: ResolvedEndpointDefinition | undefined,
    formState: PlaygroundRequestFormState | undefined,
): string {
    return buildRequestUrl(
        endpoint?.defaultEnvironment?.baseUrl,
        endpoint?.path,
        formState?.pathParameters,
        formState?.queryParameters,
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
    endpoint: ResolvedEndpointDefinition | undefined,
    formState: PlaygroundEndpointRequestFormState,
    redacted = true,
): string {
    if (endpoint == null) {
        return "";
    }
    const headers = redacted ? buildRedactedHeaders(endpoint, formState) : buildUnredactedHeaders(endpoint, formState);

    function buildFetch(body: string | undefined) {
        if (endpoint == null) {
            return "";
        }
        return `// ${endpoint.name} (${endpoint.method} ${endpoint.path
            .map((part) => (part.type === "literal" ? part.value : `:${part.key}`))
            .join("")})
const response = fetch("${buildEndpointUrl(endpoint, formState)}", {
  method: "${endpoint.method}",
  headers: ${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${!isEmpty(body) ? `\n  body: ${body},` : ""}
});

const body = await response.json();
console.log(body);`;
    }

    if (formState.body == null) {
        return buildFetch(undefined);
    }

    return visitDiscriminatedUnion(formState.body, "type")._visit<string>({
        "octet-stream": () => buildFetch('document.querySelector("input[type=file]").files[0]'), // TODO: implement this
        json: ({ value }) =>
            buildFetch(
                value != null ? indentAfter(`JSON.stringify(${JSON.stringify(value, undefined, 2)})`, 2, 0) : undefined,
            ),
        "form-data": ({ value }) => {
            const file = Object.entries(value)
                .filter(([, v]) => v.type === "file")
                .map(([k]) => {
                    return `const ${k}File = document.getElementById("${k}").files[0];
formData.append("${k}", ${k}File);`;
                })
                .join("\n\n");

            const fileArrays = Object.entries(value)
                .filter(([, v]) => v.type === "fileArray")
                .map(([k]) => {
                    return `const ${k}Files = document.getElementById("${k}").files;
${k}Files.forEach((file) => {
  formData.append("${k}", file);
});`;
                })
                .join("\n\n");

            const jsons = Object.entries(value)
                .filter(([, v]) => v.type === "json")
                .map(([k, v]) => {
                    return `formData.append("${k}", ${indentAfter(`JSON.stringify(${JSON.stringify(v.value, undefined, 2)})`, 2, 0)});`;
                })
                .join("\n\n");

            const appendStatements = [file, fileArrays, jsons].filter((v) => v.length > 0).join("\n\n");

            return `// Create a new FormData instance
const formData = new FormData();${appendStatements.length > 0 ? "\n\n" + appendStatements : ""}

${buildFetch("formData")}`;
        },
        _other: () => buildFetch(undefined),
    });
}

export function stringifyPythonRequests(
    endpoint: ResolvedEndpointDefinition | undefined,
    formState: PlaygroundEndpointRequestFormState,
    redacted = true,
): string {
    if (endpoint == null) {
        return "";
    }

    const headers = redacted ? buildRedactedHeaders(endpoint, formState) : buildUnredactedHeaders(endpoint, formState);

    const imports = ["requests"];

    interface PythonRequestParams {
        json?: string;
        data?: string;
        files?: string;
    }

    function buildRequests({ json, data, files }: PythonRequestParams) {
        if (endpoint == null) {
            return "";
        }
        return `# ${endpoint.name} (${endpoint.method} ${buildPath(endpoint.path)})
response = requests.${endpoint.method.toLowerCase()}(
  "${buildEndpointUrl(endpoint, formState)}",
  headers=${indentAfter(JSON.stringify(headers, undefined, 2), 2, 0)},${json != null ? `\n  json=${indentAfter(json, 2, 0)},` : ""}${
      data != null ? `\n  data=${indentAfter(data, 2, 0)},` : ""
  }${files != null ? `\n  files=${indentAfter(files, 2, 0)},` : ""}
)

print(response.json())`;
    }

    if (formState.body == null) {
        return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({})}`;
    }

    return visitDiscriminatedUnion(formState.body, "type")._visit<string>({
        json: ({ value }) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ json: JSON.stringify(value, undefined, 2) })}`,
        "form-data": ({ value }) => {
            const singleFiles = Object.entries(value)
                .filter((entry): entry is [string, PlaygroundFormDataEntryValue.SingleFile] =>
                    PlaygroundFormDataEntryValue.isSingleFile(entry[1]),
                )
                .map(([k, v]) => {
                    if (v.value == null) {
                        return undefined;
                    }
                    return `'${k}': ('${v.value.name}', open('${v.value.name}', 'rb')),`;
                })
                .filter(isNonNullish);
            const fileArrays = Object.entries(value)
                .filter((entry): entry is [string, PlaygroundFormDataEntryValue.MultipleFiles] =>
                    PlaygroundFormDataEntryValue.isMultipleFiles(entry[1]),
                )
                .map(([k, v]) => {
                    const fileStrings = v.value.map((file) => `('${file.name}', open('${file.name}', 'rb'))`);
                    if (fileStrings.length === 0) {
                        return;
                    }
                    return `'${k}': [${fileStrings.length === 0 ? fileStrings[0] : indentAfter(`\n${fileStrings.join(",\n")},\n`, 2, 0)}],`;
                })
                .filter(isNonNullish);

            const fileEntries = [...singleFiles, ...fileArrays].join("\n");
            const files = fileEntries.length > 0 ? `{\n${indentAfter(fileEntries, 2)}\n}` : undefined;

            const dataEntries = Object.entries(value)
                .filter((entry): entry is [string, PlaygroundFormDataEntryValue.Json] =>
                    PlaygroundFormDataEntryValue.isJson(entry[1]),
                )
                .map(([k, v]) =>
                    v.value == null
                        ? undefined
                        : `'${k}': json.dumps(${indentAfter(JSON.stringify(v.value, undefined, 2), 2, 0)}),`,
                )
                .filter(isNonNullish)
                .join("\n");

            const data = dataEntries.length > 0 ? `{\n${indentAfter(dataEntries, 2)}\n}` : undefined;

            if (data != null) {
                imports.push("json");
            }

            return `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ data, files })}`;
        },
        "octet-stream": (f) => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({ data: f.value != null ? `open('${f.value?.name}', 'rb').read()` : undefined })}`,
        _other: () => `${imports.map((pkg) => `import ${pkg}`).join("\n")}

${buildRequests({})}`,
    });
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
    endpoint: ResolvedEndpointDefinition,
    formState: PlaygroundRequestFormState,
): Record<string, string> {
    const headers: Record<string, string> = { ...mapValues(formState.headers, unknownToString) };

    if (endpoint.auth != null && formState.auth != null) {
        const { auth } = endpoint;
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
                // is this right?
                if (auth.type === "basicAuth") {
                    headers["Authorization"] = `Basic ${btoa(
                        `${basicAuth.username}:${obfuscateSecret(basicAuth.password)}`,
                    )}`;
                }
            },
            _other: noop,
        });
    }

    const requestBody = endpoint.requestBody[0];
    if (endpoint.method !== "GET" && requestBody?.contentType != null) {
        headers["Content-Type"] = requestBody.contentType;
    }

    return headers;
}

export function buildUnredactedHeaders(
    endpoint: ResolvedEndpointDefinition,
    formState: PlaygroundRequestFormState,
): Record<string, string> {
    const headers: Record<string, string> = { ...mapValues(formState.headers, unknownToString) };

    if (endpoint.auth != null && formState?.auth != null) {
        const { auth } = endpoint;
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

    const requestBody = endpoint.requestBody[0];
    if (endpoint.method !== "GET" && requestBody?.contentType != null) {
        headers["Content-Type"] = requestBody.contentType;
    }

    return headers;
}

export function stringifyCurl(
    endpoint: ResolvedEndpointDefinition | undefined,
    formState: PlaygroundEndpointRequestFormState,
    redacted = true,
): string {
    if (endpoint == null) {
        return "";
    }
    const headers = redacted ? buildRedactedHeaders(endpoint, formState) : buildUnredactedHeaders(endpoint, formState);

    return stringifyHttpRequestExampleToCurl({
        method: endpoint.method,
        url: buildRequestUrl(endpoint?.defaultEnvironment?.baseUrl, endpoint?.path, formState?.pathParameters),
        urlQueries: formState.queryParameters,
        headers,
        body:
            formState.body == null
                ? undefined
                : visitDiscriminatedUnion(formState.body, "type")._visit<ResolvedExampleEndpointRequest | undefined>({
                      json: ({ value }) => ({ type: "json", value }),
                      "form-data": ({ value }): ResolvedExampleEndpointRequest.Form | undefined => {
                          const newValue: Record<string, ResolvedFormValue> = {};
                          for (const [key, v] of Object.entries(value)) {
                              const convertedV = convertPlaygroundFormDataEntryValueToResolvedExampleEndpointRequest(v);
                              if (convertedV != null) {
                                  newValue[key] = convertedV;
                              }
                          }
                          if (isEmpty(newValue)) {
                              return undefined;
                          }
                          return { type: "form", value: newValue };
                      },
                      "octet-stream": ({ value }): ResolvedExampleEndpointRequest.Stream | undefined =>
                          value != null ? { type: "stream", fileName: value.name } : undefined,
                      _other: () => undefined,
                  }),
    });
}

export function getDefaultValueForObjectProperties(
    properties: ResolvedObjectProperty[] = [],
    types: Record<string, ResolvedTypeDefinition>,
): Record<string, unknown> {
    return properties.reduce<Record<string, unknown>>((acc, property) => {
        acc[property.key] = getDefaultValueForType(property.valueShape, types);
        return acc;
    }, {});
}

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
        string: () => typeof value === "string",
        boolean: () => typeof value === "boolean",
        integer: () => typeof value === "number" && Number.isInteger(value),
        double: () => typeof value === "number",
        long: () => typeof value === "number" && Number.isInteger(value),
        datetime: () => value instanceof Date,
        uuid: () => typeof value === "string",
        base64: () => typeof value === "string",
        date: () => value instanceof Date,
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
        stringLiteral: (literalType) => value === literalType.value,
        booleanLiteral: (literalType) => value === literalType.value,
        unknown: () => value == null,
        _other: () => value == null,
        alias: (reference) => matchesTypeReference(reference.shape, value, types),
    });
}

export function getDefaultValuesForBody(
    requestShape: ResolvedHttpRequestBodyShape | undefined,
    types: Record<string, ResolvedTypeDefinition>,
): PlaygroundFormStateBody | undefined {
    if (requestShape == null) {
        return undefined;
    }
    return visitResolvedHttpRequestBodyShape<PlaygroundFormStateBody | undefined>(requestShape, {
        fileUpload: () => ({ type: "form-data", value: {} }),
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
        string: () => "",
        boolean: () => false,
        integer: () => 0,
        double: () => 0,
        long: () => 0,
        datetime: () => new Date().toISOString(),
        uuid: () => "",
        base64: () => "",
        date: () => new Date().toISOString(),
        optional: () => undefined,
        list: () => [],
        set: () => [],
        map: () => ({}),
        stringLiteral: (literal) => literal.value,
        booleanLiteral: (literal) => literal.value,
        unknown: () => undefined,
        _other: () => undefined,
        alias: (alias) => getDefaultValueForType(alias.shape, types),
    });
}

export function isExpandable(
    valueShape: ResolvedTypeShape,
    currentValue: unknown,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(unwrapReference(valueShape, types), "type")._visit<boolean>({
        object: () => false,
        discriminatedUnion: () => false,
        undiscriminatedUnion: () => false,
        enum: () => false,
        optional: (optional) => isExpandable(optional.shape, currentValue, types),
        list: () => Array.isArray(currentValue) && currentValue.length > 0,
        set: () => Array.isArray(currentValue) && currentValue.length > 0,
        map: () => isPlainObject(currentValue) && Object.keys(currentValue).length > 0,
        unknown: () => false,
        _other: () => false,
        string: () => false,
        boolean: () => false,
        integer: () => false,
        double: () => false,
        long: () => false,
        datetime: () => false,
        uuid: () => false,
        base64: () => false,
        date: () => false,
        booleanLiteral: () => false,
        stringLiteral: () => false,
        alias: (alias) => isExpandable(alias.shape, currentValue, types),
    });
}

export function hasRequiredFields(
    bodyShape: ResolvedHttpRequestBodyShape,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitResolvedHttpRequestBodyShape(bodyShape, {
        fileUpload: (fileUpload) =>
            fileUpload.value?.properties.some((property) =>
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
                string: () => true,
                boolean: () => true,
                object: (object) =>
                    dereferenceObjectProperties(object, types).some((property) =>
                        hasRequiredFields(property.valueShape, types),
                    ),
                undiscriminatedUnion: () => true,
                discriminatedUnion: () => true,
                enum: () => true,
                integer: () => true,
                double: () => true,
                long: () => true,
                datetime: () => true,
                uuid: () => true,
                base64: () => true,
                date: () => true,
                optional: () => false,
                list: () => true,
                set: () => true,
                map: () => true,
                booleanLiteral: () => true,
                stringLiteral: () => true,
                unknown: () => true,
                alias: (alias) => hasRequiredFields(alias.shape, types),
                _other: () => true,
            }),
    });
}

export function hasOptionalFields(
    bodyShape: ResolvedHttpRequestBodyShape,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitResolvedHttpRequestBodyShape(bodyShape, {
        fileUpload: (fileUpload) =>
            fileUpload.value?.properties.some((property) =>
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
                string: () => false,
                boolean: () => false,
                object: (object) =>
                    dereferenceObjectProperties(object, types).some((property) =>
                        hasOptionalFields(property.valueShape, types),
                    ),
                undiscriminatedUnion: () => false,
                discriminatedUnion: () => false,
                enum: () => false,
                integer: () => false,
                double: () => false,
                long: () => false,
                datetime: () => false,
                uuid: () => false,
                base64: () => false,
                date: () => false,
                optional: () => true,
                list: () => false,
                set: () => false,
                map: () => false,
                booleanLiteral: () => false,
                stringLiteral: () => false,
                unknown: () => false,
                alias: (alias) => hasOptionalFields(alias.shape, types),
                _other: () => false,
            }),
    });
}

export const ENUM_RADIO_BREAKPOINT = 5;

export function shouldRenderInline(
    typeReference: ResolvedTypeShape,
    types: Record<string, ResolvedTypeDefinition>,
): boolean {
    return visitDiscriminatedUnion(unwrapReference(typeReference, types), "type")._visit({
        string: () => true,
        boolean: () => true,
        object: () => false,
        map: () => false,
        undiscriminatedUnion: () => false,
        discriminatedUnion: () => false,
        enum: (_enum) => true,
        integer: () => true,
        double: () => true,
        long: () => true,
        datetime: () => true,
        uuid: () => true,
        base64: () => true,
        date: () => true,
        optional: () => false,
        list: () => false,
        set: () => false,
        booleanLiteral: () => true,
        stringLiteral: () => true,
        unknown: () => false,
        alias: (alias) => shouldRenderInline(alias.shape, types),
        _other: () => false,
    });
}
