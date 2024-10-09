import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import compact from "lodash-es/compact";
import { noop } from "ts-essentials";
import urljoin from "url-join";
import type * as Latest from "../latest";

interface SnippetHttpRequestBodyJson {
    type: "json";
    value?: unknown;
}

interface SnippetHttpRequestBodyForm {
    type: "form";
    value: Record<string, SnippetHttpRequestBodyFormValue>;
}

interface SnippetHttpRequestBodyFormValueFilename {
    type: "filename";
    filename: string;
    contentType: string | undefined;
}

interface SnippetHttpRequestBodyFormValueFilenames {
    type: "filenames";
    files: Omit<SnippetHttpRequestBodyFormValueFilename, "type">[];
}

export type SnippetHttpRequestBodyFormValue =
    | SnippetHttpRequestBodyJson
    | SnippetHttpRequestBodyFormValueFilename
    | SnippetHttpRequestBodyFormValueFilenames;

interface SnippetHttpRequestBodyBytes {
    type: "bytes";
    filename: string;
}

export type SnippetHttpRequestBody =
    | SnippetHttpRequestBodyJson
    | SnippetHttpRequestBodyForm
    | SnippetHttpRequestBodyBytes;

export interface SnippetHttpRequest {
    method: string;
    url: string;
    searchParams: Record<string, unknown>;
    headers: Record<string, unknown>;
    basicAuth?: {
        username: string;
        password: string;
    };
    body: SnippetHttpRequestBody | undefined;
}

// TODO: validate that global headers are also included in the example by CLI or FDR
export function toSnippetHttpRequest(
    endpoint: Latest.EndpointDefinition,
    example: Latest.ExampleEndpointCall,
    auth: Latest.AuthScheme | undefined,
): SnippetHttpRequest {
    const environmentUrl = (
        endpoint.environments?.find((env) => env.id === endpoint.defaultEnvironment) ?? endpoint.environments?.[0]
    )?.baseUrl;
    const url = urljoin(compact([environmentUrl, example.path]));

    const headers: Record<string, unknown> = { ...example.headers };

    let basicAuth: { username: string; password: string } | undefined;

    if (endpoint.auth && endpoint.auth.length > 0 && auth) {
        visitDiscriminatedUnion(auth, "type")._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                basicAuth = { username: `<${usernameName}>`, password: `<${passwordName}>` };
            },
            bearerAuth: ({ tokenName = "token" }) => {
                headers.Authorization = `Bearer <${tokenName}>`;
            },
            header: ({ headerWireValue, nameOverride = headerWireValue, prefix }) => {
                headers[headerWireValue] = prefix != null ? `${prefix} <${nameOverride}>` : `<${nameOverride}>`;
            },
            oAuth: ({ value: clientCredentials }) => {
                visitDiscriminatedUnion(clientCredentials, "type")._visit({
                    clientCredentials: () => {
                        headers.Authorization = "Bearer <token>";
                    },
                    _other: noop,
                });
            },
            _other: noop,
        });
    }

    const body: Latest.ExampleEndpointRequest | undefined = example.requestBody;

    if (endpoint.request?.contentType != null) {
        headers["Content-Type"] = endpoint.request?.contentType;
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
        searchParams: example.queryParameters ?? {},
        headers: JSON.parse(JSON.stringify(headers)),
        basicAuth,
        body:
            body == null
                ? undefined
                : visitDiscriminatedUnion(body)._visit<SnippetHttpRequestBody | undefined>({
                      json: (value) => value,
                      form: (value) => {
                          const toRet: Record<string, SnippetHttpRequestBodyFormValue> = {};
                          for (const [key, val] of Object.entries(value.value)) {
                              toRet[key] = visitDiscriminatedUnion(val)._visit<SnippetHttpRequestBodyFormValue>({
                                  json: (value) => value,
                                  filename: (value) => ({
                                      type: "filename",
                                      filename: value.value,
                                      contentType: undefined, // TODO: infer content type?
                                  }),
                                  filenames: (value) => ({
                                      type: "filenames",
                                      files: value.value.map((filename) => ({
                                          filename,
                                          contentType: undefined, // TODO: infer content type?
                                      })),
                                  }),
                                  filenameWithData: (value) => ({
                                      type: "filename",
                                      filename: value.filename,
                                      contentType: undefined, // TODO: infer content type?
                                  }),
                                  filenamesWithData: (value) => ({
                                      type: "filenames",
                                      files: value.value.map(({ filename }) => ({
                                          filename,
                                          contentType: undefined, // TODO: infer content type?
                                      })),
                                  }),
                              });
                          }
                          return { type: "form", value: toRet };
                      },
                      // TODO: filename should be provided in the example from the API definition
                      bytes: () => ({ type: "bytes", filename: "<filename>" }),
                      _other: () => undefined,
                  }),
    };
}
