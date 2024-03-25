import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { keyBy, mapValues, noop } from "lodash-es";
import { buildRequestUrl } from "../../api-playground/utils";
import { getEndpointEnvironmentUrl } from "../../util/endpoint";
import {
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointRequest,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
    dereferenceObjectProperties,
} from "../../util/resolver";

export interface HttpRequestExample {
    method: string;
    url: string;
    urlQueries: Record<string, unknown>;
    headers: Record<string, unknown>;
    basicAuth?: {
        username: string;
        password: string;
    };
    body: ResolvedExampleEndpointRequest | null | undefined;
}

export function endpointExampleToHttpRequestExample(
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | null | undefined,
): HttpRequestExample {
    const environmentUrl = getEndpointEnvironmentUrl(endpoint) ?? "http://localhost:8000";
    const url = buildRequestUrl(environmentUrl, endpoint.path, example.pathParameters);

    const headers: Record<string, unknown> = { ...example.headers };

    let basicAuth: { username: string; password: string } | undefined;

    if (endpoint.auth != null) {
        visitDiscriminatedUnion(endpoint.auth, "type")._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                basicAuth = { username: `<${usernameName}>`, password: `<${passwordName}>` };
            },
            bearerAuth: ({ tokenName = "token" }) => {
                headers.Authorization = `Bearer <${tokenName}>`;
            },
            header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                headers[headerWireValue] = `<${nameOverride}>`;
            },
            _other: noop,
        });
    }

    const body: ResolvedExampleEndpointRequest | null | undefined = requestBody;

    if (endpoint.requestBody[0]?.contentType != null) {
        headers["Content-Type"] = endpoint.requestBody[0]?.contentType;
    }

    if (body != null && headers["Content-Type"] == null) {
        if (body.type === "json") {
            headers["Content-Type"] = "application/json";
        } else if (body.type === "form") {
            headers["Content-Type"] = "multipart/form-data";
        }
    }

    return {
        method: endpoint.method,
        url,
        urlQueries: example.queryParameters,
        headers: JSON.parse(JSON.stringify(headers)),
        basicAuth,
        body,
    };
}

function requiresUrlEncode(str: string): boolean {
    return encodeURIComponent(str) !== str;
}

export function stringifyHttpRequestExampleToCurl(request: HttpRequestExample): string {
    try {
        return unsafeStringifyHttpRequestExampleToCurl(request);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return "";
    }
}

function unsafeStringifyHttpRequestExampleToCurl({
    method,
    url,
    urlQueries,
    headers,
    basicAuth,
    body,
}: HttpRequestExample): string {
    const queryParams = toUrlEncoded(urlQueries)
        .map(([key, value]) => `${key}=${encodeURIComponent(unknownToString(value))}`)
        .join("&");
    const httpRequest =
        method !== "GET"
            ? queryParams.length > 0
                ? `-X ${method} "${url}?${queryParams}"`
                : `-X ${method} ${url}`
            : queryParams.length > 0
              ? `-G ${url}`
              : url;
    const headersString = Object.entries(headers)
        .map(([key, value]) => ` \\\n     -H "${key}: ${value}"`)
        .join("");
    const basicAuthString = basicAuth != null ? ` \\\n     -u "${basicAuth.username}:${basicAuth.password}"` : "";

    // GET requests don't have a body, so `--data-urlencode` is used to pass query parameters
    const urlQueriesGetString =
        method === "GET"
            ? toUrlEncoded(urlQueries)
                  .map(
                      ([key, value]) =>
                          ` \\\n     ${requiresUrlEncode(value) ? "--data-urlencode" : "-d"} ${key.includes("[") ? `"${key}"` : key}=${value.includes(" ") ? `"${value}"` : value}`,
                  )
                  .join("")
            : "";

    const bodyDataString =
        body == null || method === "GET"
            ? ""
            : visitDiscriminatedUnion(body, "type")._visit({
                  json: ({ value }) =>
                      value == null
                          ? ""
                          : ` \\\n     -d ${typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : `'${JSON.stringify(value, null, 2).replace(/'/g, "\\'")}'`}`,
                  form: ({ value }) =>
                      Object.entries(value)
                          .map(([key, value]) =>
                              visitDiscriminatedUnion(value, "type")._visit({
                                  json: ({ value }) => {
                                      if (value == null) {
                                          return "";
                                      }

                                      if (typeof value === "string") {
                                          return ` \\\n     -F ${key}="${value.replace(/"/g, '\\"')}"`;
                                      }

                                      const stringValue = JSON.stringify(value, null, 2);

                                      return ` \\\n     -F ${key}='${stringValue.replace(/'/g, "\\'")}'`;
                                  },
                                  file: ({ fileName }) =>
                                      ` \\\n     -F ${key}=@${fileName.includes(" ") ? `"${fileName}"` : fileName}`,
                                  fileArray: ({ fileNames }) =>
                                      fileNames
                                          .map(
                                              (fileName) =>
                                                  ` \\\n     -F "${key}[]"=@${fileName.includes(" ") ? `"${fileName}"` : fileName}`,
                                          )
                                          .join(""),
                                  _other: () => "",
                              }),
                          )
                          .join(""),
                  stream: ({ fileName }) => {
                      if (fileName == null) {
                          return "";
                      }
                      return ` \\\n     --data-binary @${fileName.includes(" ") ? `"${fileName}"` : fileName}`;
                  },
                  _other: () => "",
              });

    return `curl ${httpRequest}${headersString}${basicAuthString}${urlQueriesGetString}${bodyDataString}`;
}

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
function toUrlEncoded(urlQueries: Record<string, unknown>): Array<[string, string]> {
    return Object.entries(urlQueries).flatMap(([key, value]): [string, string][] => {
        if (Array.isArray(value)) {
            return value.map((v) => [`${key}[]`, unknownToString(v)]);
        }
        return [[key, unknownToString(value)]];
    });
}
