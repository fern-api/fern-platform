import { unknownToString } from "@fern-api/ui-core-utils";
import visitDiscriminatedUnion from "@fern-api/ui-core-utils/visitDiscriminatedUnion";
import { QueryParameterArrayEncoding } from "../latest";
import { SnippetHttpRequest } from "./SnippetHttpRequest";

function requiresUrlEncode(str: string): boolean {
    return encodeURIComponent(str) !== str;
}

interface Flags {
    usesApplicationJsonInFormDataValue: boolean;
}

export async function convertToCurl(request: SnippetHttpRequest, opts: Flags): Promise<string> {
    try {
        return await unsafeStringifyHttpRequestExampleToCurl(request, opts);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        return "";
    }
}

async function unsafeStringifyHttpRequestExampleToCurl(
    { method, url, queryParameters, queryParametersEncoding, headers, basicAuth, body }: SnippetHttpRequest,
    { usesApplicationJsonInFormDataValue }: Flags,
): Promise<string> {
    const urlEncodedQueryParams = await toUrlEncoded({ queryParameters, queryParametersEncoding });

    const queryParams = Object.entries(urlEncodedQueryParams)
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
            ? Object.entries(urlEncodedQueryParams)
                  .map(
                      ([key, value]) =>
                          ` \\\n     ${requiresUrlEncode(value) ? "--data-urlencode" : "-d"} ${key.includes("[") ? `"${key}"` : key}=${value.includes(" ") ? `"${value}"` : value}`,
                  )
                  .join("")
            : "";

    const bodyDataString =
        body == null || method === "GET"
            ? ""
            : visitDiscriminatedUnion(body)._visit({
                  json: ({ value }) =>
                      value == null
                          ? ""
                          : ` \\\n     -d ${typeof value === "string" ? `"${value.replace(/"/g, '\\"')}"` : `'${JSON.stringify(value, null, 2).replace(/'/g, "\\'")}'`}`,
                  form: ({ value }) =>
                      Object.entries(value)
                          .map(([key, value]) =>
                              visitDiscriminatedUnion(value)._visit({
                                  json: ({ value }) => {
                                      if (value == null) {
                                          return "";
                                      }

                                      if (typeof value === "string") {
                                          return ` \\\n     -F ${key}="${value.replace(/"/g, '\\"')}${usesApplicationJsonInFormDataValue ? ";type=application/json" : ""}"`;
                                      }

                                      const stringValue = JSON.stringify(value, null, 2);

                                      return ` \\\n     -F ${key}='${stringValue.replace(/'/g, "'\\''")}${usesApplicationJsonInFormDataValue ? ";type=application/json" : ""}'`;
                                  },
                                  filename: ({ filename, contentType }) => {
                                      if (filename == null) {
                                          return "";
                                      }
                                      return ` \\\n     -F ${key}=@${filename.includes(" ") || contentType != null ? `"${filename}${contentType != null ? `;type=${contentType}` : ""}"` : filename}`;
                                  },
                                  filenames: ({ files }) =>
                                      files
                                          .filter((file) => file.filename != null)
                                          .map(
                                              ({ filename, contentType }) =>
                                                  ` \\\n     -F "${key}[]"=@${filename.includes(" ") || contentType != null ? `"${filename}${contentType != null ? `;type=${contentType}` : ""}"` : filename}`,
                                          )
                                          .join(""),
                                  _other: () => "",
                              }),
                          )
                          .join(""),
                  bytes: ({ filename }) => {
                      return ` \\\n     --data-binary @${filename.includes(" ") ? `"${filename}"` : filename}`;
                  },
                  _other: () => "",
              });

    return `curl ${httpRequest}${headersString}${basicAuthString}${urlQueriesGetString}${bodyDataString}`;
}

async function toUrlEncoded({
    queryParameters,
    queryParametersEncoding,
}: {
    queryParameters: Record<string, unknown>;
    queryParametersEncoding: Record<string, QueryParameterArrayEncoding>;
}): Promise<Record<string, string>> {
    return Object.fromEntries(
        await Promise.all(
            Object.entries(queryParameters).flatMap(async ([key, value]): Promise<[string, string][]> => {
                // Dynamically import the qs library
                const qs = await import("qs");

                const queryParamValue = qs.stringify(value, {
                    arrayFormat: queryParametersEncoding[key] === "comma" ? "comma" : "repeat",
                });

                return [[key, queryParamValue]];
            }),
        ),
    );
}
