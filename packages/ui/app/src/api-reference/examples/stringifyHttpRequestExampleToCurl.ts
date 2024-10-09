import { unknownToString, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { HttpRequestExample } from "./HttpRequestExample";

function requiresUrlEncode(str: string): boolean {
    return encodeURIComponent(str) !== str;
}

export function stringifyHttpRequestExampleToCurl(request: HttpRequestExample): string {
    try {
        return unsafeStringifyHttpRequestExampleToCurl(request);
    } catch (e) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error(
            "Unable to stringify HTTP request example to curl. This is used to generate a curl command for the user to copy and paste into their terminal. When this fails, the user will not be able to see the curl command.",
            e,
        );

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
                                  json: ({ value, contentType }) => {
                                      if (value == null) {
                                          return "";
                                      }

                                      if (typeof value === "string") {
                                          return ` \\\n     -F ${key}="${value.replace(/"/g, '\\"')}${contentType != null ? `;type=${contentType}` : ""}"`;
                                      }

                                      const stringValue = JSON.stringify(value, null, 2);

                                      return ` \\\n     -F ${key}='${stringValue.replace(/'/g, "'\\''")}${contentType != null ? `;type=${contentType}` : ""}'`;
                                  },
                                  file: ({ fileName, contentType }) => {
                                      if (fileName == null) {
                                          return "";
                                      }
                                      return ` \\\n     -F ${key}=@${fileName.includes(" ") || contentType != null ? `"${fileName}${contentType != null ? `;type=${contentType}` : ""}"` : fileName}`;
                                  },
                                  fileArray: ({ files }) =>
                                      files
                                          .filter((file) => file.fileName != null)
                                          .map(
                                              ({ fileName, contentType }) =>
                                                  ` \\\n     -F "${key}[]"=@${fileName.includes(" ") || contentType != null ? `"${fileName}${contentType != null ? `;type=${contentType}` : ""}"` : fileName}`,
                                          )
                                          .join(""),
                                  _other: () => "",
                              }),
                          )
                          .join(""),
                  bytes: ({ fileName }) => {
                      if (fileName == null) {
                          return "";
                      }
                      return ` \\\n     --data-binary @${fileName.includes(" ") ? `"${fileName}"` : fileName}`;
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
