import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { keyBy, mapValues, noop } from "lodash-es";
import { buildRequestUrl } from "../../api-playground/utils";
import { getEndpointEnvironmentUrl } from "../../util/endpoint";
import {
    dereferenceObjectProperties,
    ResolvedEndpointDefinition,
    ResolvedExampleEndpointRequest,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedTypeDefinition,
    ResolvedTypeShape,
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
    body: ResolvedExampleEndpointRequest | { type: "file" } | null | undefined;
}

export function endpointExampleToHttpRequestExample(
    auth: APIV1Read.ApiAuth | null | undefined,
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    requestBody: ResolvedExampleEndpointRequest | null | undefined,
): HttpRequestExample {
    const environmentUrl = getEndpointEnvironmentUrl(endpoint) ?? "http://localhost:8000";
    const url = buildRequestUrl(environmentUrl, endpoint.path, example.pathParameters);

    const headers: Record<string, unknown> = { ...example.headers };

    let basicAuth: { username: string; password: string } | undefined;

    if (auth != null && endpoint.authed) {
        visitDiscriminatedUnion(auth, "type")._visit({
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

    let body: ResolvedExampleEndpointRequest | { type: "file" } | null | undefined = requestBody;

    headers["Content-Type"] = endpoint.requestBody[0]?.contentType;

    if (body != null && headers["Content-Type"] == null) {
        if (body.type === "json") {
            headers["Content-Type"] = "application/json";
        } else if (body.type === "form") {
            headers["Content-Type"] = "multipart/form-data";
        }
    } else {
        if (endpoint.requestBody[0]?.shape.type === "fileUpload") {
            body = { type: "file" };
        }
    }

    return {
        method: endpoint.method,
        url,
        urlQueries: example.queryParameters,
        headers,
        basicAuth,
        body,
    };
}

export function stringifyHttpRequestExampleToCurl({
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

    // GET requests don't have a body, so `-d` is used to pass query parameters
    const urlQueriesGetString =
        method === "GET"
            ? toUrlEncoded(urlQueries)
                  .map(([key, value]) => ` \\\n     -d ${key.includes("[") ? `"${key}"` : key}=${value}`)
                  .join("")
            : "";

    const bodyDataString =
        body == null || method === "GET"
            ? ""
            : visitDiscriminatedUnion(body, "type")._visit({
                  json: ({ value }) =>
                      value == null ? "" : ` \\\n     -d '${JSON.stringify(value, null, 2).replace(/'/g, "\\'")}'`,
                  form: ({ value }) =>
                      Object.entries(value)
                          .map(([key, value]) =>
                              visitDiscriminatedUnion(value, "type")._visit({
                                  json: ({ value }) =>
                                      ` \\\n     -F '${key}=${JSON.stringify(value, null, 2).replace(/'/g, "\\'")}'`,
                                  filename: ({ value }) => ` \\\n     -F ${key}=@${value}`,
                                  _other: () => "",
                              }),
                          )
                          .join(""),
                  file: () => " \\\n     -d @filename",
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
            const p = dereferenceObjectProperties(object, types);
            return isPlainObject(obj)
                ? mapValues(
                      sortKeysBy(
                          obj,
                          p.map((p) => p.key),
                      ),
                      (value, key) => {
                          const property = p.find((p) => p.key === key);
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
        fileUpload: () => obj,
        fileDownload: () => obj,
        streamCondition: () => obj,
        streamingText: () => obj,
        alias: ({ shape }) => sortKeysByShape(obj, shape, types),
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
