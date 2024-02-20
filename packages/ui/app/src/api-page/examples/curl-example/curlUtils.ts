import { APIV1Read } from "@fern-api/fdr-sdk";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { noop } from "lodash-es";
import { getEndpointEnvironmentUrl } from "../../../util/endpoint";
import { ResolvedEndpointDefinition, ResolvedResponseBody } from "../../../util/resolver";
import { JsonLine, jsonLineToString } from "../json-example/jsonLineUtils";

interface CurlParamValuesSymbol {
    type: "symbol";
    value: string;
}
interface CurlParamValuesJsonLine {
    type: "jsonLine";
    value: JsonLine;
}

export type CurlParamValues = CurlParamValuesSymbol | CurlParamValuesJsonLine;

interface CurlLineParam {
    type: "param";
    paramKey?: string;
    value?: string | CurlParamValues[];
    doNotStringifyValue?: boolean;
    excludeTrailingBackslash?: boolean;
    excludeIndent?: boolean;
}

export interface CurlLineJson {
    type: "json";
    line: JsonLine;
}

export type CurlLine = CurlLineParam | CurlLineJson;

export function getCurlLines(
    auth: APIV1Read.ApiAuth | undefined,
    endpoint: ResolvedEndpointDefinition,
    example: APIV1Read.ExampleEndpointCall,
    jsonLines: JsonLine[],
): CurlLine[] {
    const parts: CurlLine[] = [];
    const environmentUrl = getEndpointEnvironmentUrl(endpoint) ?? "localhost:8000";

    if (endpoint.method !== "GET") {
        parts.push({
            type: "param",
            paramKey: "-X",
            value: endpoint.method.toUpperCase(),
            doNotStringifyValue: true,
        });
    }

    parts.push({
        type: "param",
        paramKey: "--url",
        value: `${environmentUrl}${example.path}`,
    });

    for (const queryParam of endpoint.queryParameters) {
        const value = example.queryParameters[queryParam.key];
        if (value != null) {
            parts.push({
                type: "param",
                paramKey: "--url-query",
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                value: `${queryParam.key}=${value}`,
            });
        }
    }

    const requestContentType = endpoint.requestBody != null ? endpoint.requestBody.contentType : undefined;
    if (requestContentType != null) {
        parts.push({
            type: "param",
            paramKey: "--header",
            value: `Content-Type: ${requestContentType}`,
        });
    }

    if (auth != null && endpoint.authed) {
        visitDiscriminatedUnion(auth, "type")._visit({
            basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                parts.push({
                    type: "param",
                    paramKey: "--user",
                    value: `${usernameName}:${passwordName}`,
                });
            },
            bearerAuth: ({ tokenName = "token" }) => {
                parts.push({
                    type: "param",
                    paramKey: "--header",
                    value: `Authorization: Bearer <${tokenName}>`,
                });
            },
            header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                parts.push({
                    type: "param",
                    paramKey: "--header",
                    value: `${headerWireValue}: <${nameOverride}>`,
                });
            },
            _other: noop,
        });
    }

    for (const [headerKey, value] of Object.entries(example.headers)) {
        if (value != null) {
            parts.push({
                type: "param",
                paramKey: "--header",
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                value: `${headerKey}: ${value}`,
            });
        }
    }

    if (endpoint.responseBody != null && isJsonResponse(endpoint.responseBody)) {
        parts.push({
            type: "param",
            paramKey: "--header",
            value: "Accept: application/json",
        });
    }

    if (endpoint.requestBody != null) {
        switch (endpoint.requestBody.shape.type) {
            case "fileUpload":
                parts.push({
                    type: "param",
                    paramKey: "--data",
                    value: "@file",
                });
                break;
            default: {
                if (jsonLines.length === 1 && jsonLines[0] != null) {
                    parts.push({
                        type: "param",
                        paramKey: "--data",
                        value: [
                            { type: "symbol", value: "'" },
                            { type: "jsonLine", value: jsonLines[0] },
                            { type: "symbol", value: "'" },
                        ],
                        excludeTrailingBackslash: true,
                        doNotStringifyValue: true,
                    });
                } else {
                    parts.push(
                        {
                            type: "param",
                            paramKey: "--data",
                            value: [{ type: "symbol", value: "'" }],
                            excludeTrailingBackslash: true,
                            doNotStringifyValue: true,
                        },
                        ...jsonLines.map((line): CurlLine => ({ type: "json", line })),
                        {
                            type: "param",
                            value: [{ type: "symbol", value: "'" }],
                            excludeIndent: true,
                            doNotStringifyValue: true,
                        },
                    );
                }
                break;
            }
        }
    }

    return parts;
}

function isJsonResponse(httpResponse: ResolvedResponseBody): boolean {
    switch (httpResponse.shape.type) {
        case "fileDownload":
        case "streamingText":
        case "streamCondition":
            return false;
        default:
            return true;
    }
}

const CURL_PREFIX = "curl ";
const CURL_INDENT = " ".repeat(CURL_PREFIX.length);

function curlParameterToString(
    { excludeIndent, paramKey, doNotStringifyValue, value, excludeTrailingBackslash }: CurlLineParam,
    index: number,
    isLast: boolean,
): string {
    const prefix = index === 0 ? CURL_PREFIX : excludeIndent ? "" : CURL_INDENT;

    return `${prefix}${paramKey != null ? paramKey + " " : ""}${
        doNotStringifyValue || typeof value !== "string"
            ? typeof value === "string"
                ? value
                : value?.map((v) => (v.type === "symbol" ? v.value : jsonLineToString(v.value)))
            : JSON.stringify(value)
    }${excludeTrailingBackslash || isLast ? "" : " \\"}`;
}

export function curlLinesToString(curlLines: CurlLine[]): string {
    return curlLines
        .map((curlLine, index) =>
            curlLine.type === "param"
                ? curlParameterToString(curlLine, index, index === curlLines.length - 1)
                : jsonLineToString(curlLine.line),
        )
        .join("\n");
}
