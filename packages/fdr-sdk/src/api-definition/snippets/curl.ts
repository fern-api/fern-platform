import { unknownToString } from "@fern-ui/core-utils";
import visitDiscriminatedUnion from "@fern-ui/core-utils/visitDiscriminatedUnion";
import { SnippetHttpRequest } from "./SnippetHttpRequest";

function requiresUrlEncode(str: string): boolean {
    return encodeURIComponent(str) !== str;
}

interface Flags {
    usesApplicationJsonInFormDataValue: boolean;
}

export function convertToCurl(request: SnippetHttpRequest, opts: Flags): string {
    try {
        return unsafeStringifyHttpRequestExampleToCurl(request, opts);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);

        return "";
    }
}

function unsafeStringifyHttpRequestExampleToCurl(
    { method, url, searchParams, headers, basicAuth, body }: SnippetHttpRequest,
    { usesApplicationJsonInFormDataValue }: Flags,
): string {
    const queryParams = toUrlEncoded(searchParams)
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
            ? toUrlEncoded(searchParams)
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

function toUrlEncoded(urlQueries: Record<string, unknown>): Array<[string, string]> {
    return Object.entries(urlQueries).flatMap(([key, value]): [string, string][] => {
        if (Array.isArray(value)) {
            return value.map((v) => [`${key}[]`, unknownToString(v)]);
        }
        return [[key, unknownToString(value)]];
    });
}
