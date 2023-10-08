import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointEnvironmentUrl } from "@fern-ui/app-utils";
import { assertNeverNoThrow, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { noop } from "lodash-es";
import { JsonExampleString } from "../json-example/JsonExampleString";
import { JsonLine, renderJsonLineValue } from "../json-example/jsonLineUtils";

interface CurlLineParam {
    type: "param";
    paramKey?: string;
    value?: string | JSX.Element;
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
    apiDefinition: FernRegistryApiRead.ApiDefinition,
    endpoint: FernRegistryApiRead.EndpointDefinition,
    example: FernRegistryApiRead.ExampleEndpointCall,
    jsonLines: JsonLine[]
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

    const requestContentType = endpoint.request != null ? endpoint.request.contentType : undefined;
    if (requestContentType != null) {
        parts.push({
            type: "param",
            paramKey: "--header",
            value: `Content-Type: ${requestContentType}`,
        });
    }

    if (apiDefinition.auth != null && endpoint.authed) {
        visitDiscriminatedUnion(apiDefinition.auth, "type")._visit({
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
                    value: `Authorization <${tokenName}>`,
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

    for (const header of endpoint.headers) {
        const value = example.headers[header.key];
        if (value != null) {
            parts.push({
                type: "param",
                paramKey: "--header",
                // eslint-disable-next-line @typescript-eslint/no-base-to-string
                value: `${header.key}: ${value}`,
            });
        }
    }

    if (endpoint.request != null) {
        switch (endpoint.request.type.type) {
            case "fileUpload":
                parts.push({
                    type: "param",
                    paramKey: "--data",
                    value: "@file",
                });
                break;
            case "object":
            case "reference": {
                if (jsonLines.length === 1 && jsonLines[0] != null) {
                    parts.push({
                        type: "param",
                        paramKey: "--data",
                        value: (
                            <>
                                <JsonExampleString value="'" doNotAddQuotes />
                                <span className="text-text-primary-light dark:text-text-primary-dark">
                                    {renderJsonLineValue(jsonLines[0])}
                                </span>
                                <JsonExampleString value="'" doNotAddQuotes />
                            </>
                        ),
                        excludeTrailingBackslash: true,
                        doNotStringifyValue: true,
                    });
                } else {
                    parts.push(
                        {
                            type: "param",
                            paramKey: "--data",
                            value: <JsonExampleString value="'" doNotAddQuotes />,
                            excludeTrailingBackslash: true,
                            doNotStringifyValue: true,
                        },
                        ...jsonLines.map((line): CurlLine => ({ type: "json", line })),
                        {
                            type: "param",
                            value: <JsonExampleString value="'" doNotAddQuotes />,
                            excludeIndent: true,
                            doNotStringifyValue: true,
                        }
                    );
                }
                break;
            }
            default:
                assertNeverNoThrow(endpoint.request.type);
        }
    }

    return parts;
}
