import { isPlainObject, unknownToString } from "@fern-api/ui-core-utils";
import { compact } from "es-toolkit/array";
import { UnreachableCaseError } from "ts-essentials";
import {
    SnippetHttpRequest,
    SnippetHttpRequestBodyFormValue,
    SnippetHttpRequestBodyFormValueFilename,
    SnippetHttpRequestBodyFormValueFilenames,
} from "./SnippetHttpRequest";

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

function getHttpRequest(method: string, url: string, searchParams: Record<string, unknown>): string {
    const queryParams = toUrlEncoded(searchParams)
        .map(([key, value]) => `${key}=${encodeURIComponent(unknownToString(value))}`)
        .join("&");
    if (method !== "GET") {
        return queryParams.length > 0 ? `-X ${method} "${url}?${queryParams}"` : `-X ${method} ${url}`;
    }
    // if the method is GET, we don't need to include the query params in URL, but instead we'll include it as --data-urlencode
    return queryParams.length > 0 ? `${url}` : url;
}

function getHeadersString(headers: Record<string, unknown>): string[] {
    return Object.entries(headers).map(([key, value]) => `-H "${key}: ${unknownToString(value)}"`);
}

function getBasicAuthString(basicAuth: { username: string; password: string }): string[] {
    return [`-u "${basicAuth.username}:${basicAuth.password}"`];
}

function getUrlQueriesGetString(searchParams: Record<string, unknown>): string[] {
    return toUrlEncoded(searchParams).map(
        ([key, value]) =>
            `${requiresUrlEncode(value) ? "--data-urlencode" : "-d"} ${key.includes("[") ? `"${key}"` : key}=${value.includes(" ") ? `"${value}"` : value}`,
    );
}

function getBodyJsonString(value: unknown | null | undefined): string[] {
    if (value == null) {
        return [];
    }

    if (typeof value === "string") {
        return [`-d ${`"${value.replace(/"/g, '\\"')}"`}`];
    }

    const stringifiedValue = JSON.stringify(value, null, 2).replace(/'/g, "\\'");
    return [`-d ${`'${stringifiedValue}'`}`];
}

function getBodyBytesString(filename: string): string[] {
    return [`--data-binary @${filename.includes(" ") ? `"${filename}"` : filename}`];
}

function getBodyFormValueJsonString(
    value: unknown | null | undefined,
    key: string,
    usesApplicationJsonInFormDataValue: boolean,
): string[] {
    if (value == null) {
        return [];
    }

    // TODO: this is a little sus
    if (typeof value === "string") {
        return [`-F ${key}="${value.replace(/"/g, '\\"')}"`];
    }

    const stringValue = JSON.stringify(value, null, 2);

    return [
        `-F ${key}='${stringValue.replace(/'/g, "'\\''")}${usesApplicationJsonInFormDataValue ? ";type=application/json" : ""}'`,
    ];
}

function getBodyFormValueFilenamesStrings({ files }: SnippetHttpRequestBodyFormValueFilenames, key: string): string[] {
    return files
        .filter((file) => file.filename != null)
        .map(
            ({ filename, contentType }) =>
                `-F "${key}[]"=@${filename.includes(" ") || contentType != null ? `"${filename}${contentType != null ? `;type=${contentType}` : ""}"` : filename}`,
        );
}

function getBodyFormValueFilenameString(
    { filename, contentType }: SnippetHttpRequestBodyFormValueFilename,
    key: string,
): string[] {
    if (filename == null) {
        return [];
    }
    return [
        `-F ${key}=@${filename.includes(" ") || contentType != null ? `"${filename}${contentType != null ? `;type=${contentType}` : ""}"` : filename}`,
    ];
}

function getBodyFormValueString(
    value: SnippetHttpRequestBodyFormValue,
    key: string,
    usesApplicationJsonInFormDataValue: boolean,
): string[] {
    switch (value.type) {
        case "json":
            return getBodyFormValueJsonString(value.value, key, usesApplicationJsonInFormDataValue);
        case "filename":
            return getBodyFormValueFilenameString(value, key);
        case "filenames":
            return getBodyFormValueFilenamesStrings(value, key);
        default:
            throw new UnreachableCaseError(value);
    }
}

function getBodyFormString(
    value: Record<string, SnippetHttpRequestBodyFormValue>,
    usesApplicationJsonInFormDataValue: boolean,
): string[] {
    return Object.entries(value).flatMap(([key, value]) =>
        getBodyFormValueString(value, key, usesApplicationJsonInFormDataValue),
    );
}

function getBodyDataString(
    method: string,
    body: SnippetHttpRequest["body"] | null | undefined,
    usesApplicationJsonInFormDataValue: boolean,
): string[] {
    if (method === "GET" || body == null) {
        return [];
    }

    switch (body.type) {
        case "json":
            return getBodyJsonString(body.value);
        case "bytes":
            return getBodyBytesString(body.filename);
        case "form":
            return getBodyFormString(body.value, usesApplicationJsonInFormDataValue);
        default:
            throw new UnreachableCaseError(body);
    }
}

function unsafeStringifyHttpRequestExampleToCurl(
    { method, url, searchParams, headers, basicAuth, body }: SnippetHttpRequest,
    { usesApplicationJsonInFormDataValue }: Flags,
): string {
    const httpRequest = getHttpRequest(method, url, searchParams);

    const headersStrings = getHeadersString(headers);
    const basicAuthStrings = basicAuth != null ? getBasicAuthString(basicAuth) : [];

    // special handling for application/x-www-form-urlencoded
    const isFormUrlEncoded =
        method !== "GET" &&
        unknownToString(headers["Content-Type"] ?? headers["content-type"])
            .toLowerCase()
            .includes("form-urlencoded");

    // GET requests don't have a body, so `--data-urlencode` is used to pass query parameters
    const urlQueriesGetStrings = getUrlQueriesGetString({
        ...(method === "GET" ? searchParams : {}),
        // HACK: combine search params and body.value if body.type is json, because we expect the body.json to include url-encoded params
        ...(isFormUrlEncoded && body?.type === "json" && isPlainObject(body.value) ? body.value : {}),
    });

    const bodyDataStrings = isFormUrlEncoded ? [] : getBodyDataString(method, body, usesApplicationJsonInFormDataValue);

    const allStrings = compact([...headersStrings, ...basicAuthStrings, ...urlQueriesGetStrings, ...bodyDataStrings]);

    function withNewLine(line: string): string {
        return ` \\\n     ${line}`;
    }

    return `curl ${httpRequest}${allStrings.map(withNewLine).join("")}`;
}

function toUrlEncoded(urlQueries: Record<string, unknown>): Array<[string, string]> {
    return Object.entries(urlQueries).flatMap(([key, value]): [string, string][] => {
        if (Array.isArray(value)) {
            return value.map((v) => [`${key}[]`, unknownToString(v)]);
        }
        return [[key, unknownToString(value)]];
    });
}
