import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { keyBy, mapValues, noop } from "lodash-es";
import { buildRequestUrl } from "../../api-playground/utils";
import { getEndpointEnvironmentUrl } from "../../util/endpoint";
import {
    ResolvedEndpointDefinition,
    ResolvedHttpRequestBodyShape,
    ResolvedHttpResponseBodyShape,
    ResolvedTypeReference,
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
    body: APIV1Read.ExampleEndpointRequest | { type: "file" } | undefined;
}

export function endpointExampleToHttpRequestExample(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    shape: ResolvedHttpRequestBodyShape | undefined,
): HttpRequestExample {
    const environmentUrl = getEndpointEnvironmentUrl(endpoint) ?? "localhost:8000";
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

    let body: APIV1Read.ExampleEndpointRequest | { type: "file" } | undefined =
        example.requestBodyV3?.type === "json"
            ? {
                  type: "json",
                  value: sortKeysByShape(example.requestBodyV3?.value, shape),
              }
            : example.requestBodyV3;

    if (example.requestBodyV3 != null) {
        if (example.requestBodyV3.type === "json") {
            headers["Content-Type"] = "application/json";
        } else if (example.requestBodyV3.type === "form") {
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
    headers,
    basicAuth,
    body,
}: HttpRequestExample): string {
    return `curl ${method === "GET" ? "" : `-X ${method} `}"${url}"${Object.entries(headers)
        .map(([key, value]) => ` \\\n     -H "${key}: ${value}"`)
        .join("")}${basicAuth != null ? ` \\\n     -u "${basicAuth.username}:${basicAuth.password}"` : ""}${
        body == null
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
              })
    }`;
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
    shape: ResolvedTypeReference | ResolvedHttpRequestBodyShape | ResolvedHttpResponseBodyShape | undefined,
): unknown {
    if ((!isPlainObject(obj) && !Array.isArray(obj)) || shape == null) {
        return obj;
    }
    return visitDiscriminatedUnion(shape, "type")._visit({
        string: () => obj,
        boolean: () => obj,
        object: ({ properties }) => {
            const p = properties();
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
                          return sortKeysByShape(value, property.valueShape);
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
            const variantProperties = variants.find((v) => v.discriminantValue === variant)?.additionalProperties;
            if (variantProperties == null) {
                return obj;
            }
            return mapValues(sortKeysBy(obj, [discriminant, ...variantProperties.map((p) => p.key)]), (value, key) => {
                if (key === discriminant) {
                    return value;
                }
                const property = variantProperties.find((p) => p.key === key);
                if (property == null) {
                    return value;
                }
                return sortKeysByShape(value, property.valueShape);
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
        optional: ({ shape }) => sortKeysByShape(obj, shape),
        list: ({ shape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, shape)) : obj),
        set: ({ shape }) => (Array.isArray(obj) ? obj.map((o) => sortKeysByShape(o, shape)) : obj),
        map: ({ valueShape }) =>
            isPlainObject(obj) ? mapValues(obj, (value) => sortKeysByShape(value, valueShape)) : obj,
        booleanLiteral: () => obj,
        stringLiteral: () => obj,
        unknown: () => obj,
        reference: ({ shape }) => sortKeysByShape(obj, shape()),
        fileUpload: () => obj,
        fileDownload: () => obj,
        streamCondition: () => obj,
        streamingText: () => obj,
        _other: () => obj,
    });
}
