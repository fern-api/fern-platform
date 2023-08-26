import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { assertNever, assertNeverNoThrow, noop, visitDiscriminatedUnion } from "@fern-ui/core-utils";
import React, { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { getEndpointEnvironmentUrl } from "../../endpoints/getEndpointEnvironmentUrl";
import { JsonExampleContext, JsonExampleContextValue } from "../json-example/contexts/JsonExampleContext";
import { JsonPropertyPath } from "../json-example/contexts/JsonPropertyPath";
import { JsonExampleString } from "../json-example/JsonExampleString";
import { JsonItemBottomLine } from "../json-example/JsonItemBottomLine";
import { JsonItemMiddleLines } from "../json-example/JsonItemMiddleLines";
import { JsonItemTopLine } from "../json-example/JsonItemTopLine";
import { CurlExampleLine } from "./CurlExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";
import { CurlParameter } from "./CurlParameter";

export declare namespace CurlExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
        selectedProperty: JsonPropertyPath | undefined;
        parent: HTMLElement | undefined;
    }
}

const CURL_PREFIX = "curl ";

export const CurlExample: React.FC<CurlExample.Props> = ({ endpoint, example, selectedProperty, parent }) => {
    const { apiDefinition } = useApiDefinitionContext();

    const contextValue = useCallback(
        (): JsonExampleContextValue => ({
            selectedProperty,
            containerRef: parent,
        }),
        [parent, selectedProperty]
    );

    const environmentUrl = useMemo(() => getEndpointEnvironmentUrl(endpoint) ?? "localhost:8000", [endpoint]);

    const partsExcludingCurlCommand = useMemo(() => {
        const parts: CurlExamplePart[] = [];

        if (endpoint.method !== "GET") {
            parts.push({
                type: "line",
                value: <CurlParameter paramKey="-X" value={endpoint.method.toUpperCase()} doNotStringifyValue />,
            });
        }

        parts.push({
            type: "line",
            value: <CurlParameter paramKey="--url" value={`${environmentUrl}${example.path}`} />,
        });

        for (const queryParam of endpoint.queryParameters) {
            const value = example.queryParameters[queryParam.key];
            if (value != null) {
                parts.push({
                    type: "line",
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: <CurlParameter paramKey="--url-query" value={`${queryParam.key}=${value}`} />,
                });
            }
        }

        const requestContentType = endpoint.request != null ? endpoint.request.contentType : undefined;
        if (requestContentType != null) {
            parts.push({
                type: "line",
                value: <CurlParameter paramKey="--header" value={`Content-Type: ${requestContentType}`} />,
            });
        }

        if (apiDefinition.auth != null && endpoint.authed) {
            visitDiscriminatedUnion(apiDefinition.auth, "type")._visit({
                basicAuth: ({ usernameName = "username", passwordName = "password" }) => {
                    parts.push({
                        type: "line",
                        value: <CurlParameter paramKey="--user" value={`${usernameName}:${passwordName}`} />,
                    });
                },
                bearerAuth: ({ tokenName = "token" }) => {
                    parts.push({
                        type: "line",
                        value: <CurlParameter paramKey="--header" value={`Authorization <${tokenName}>`} />,
                    });
                },
                header: ({ headerWireValue, nameOverride = headerWireValue }) => {
                    parts.push({
                        type: "line",
                        value: <CurlParameter paramKey="--header" value={`${headerWireValue}: <${nameOverride}>`} />,
                    });
                },
                _other: noop,
            });
        }

        for (const header of endpoint.headers) {
            const value = example.headers[header.key];
            if (value != null) {
                parts.push({
                    type: "line",
                    // eslint-disable-next-line @typescript-eslint/no-base-to-string
                    value: <CurlParameter paramKey="--header" value={`${header.key}: ${value}`} />,
                });
            }
        }

        if (endpoint.request != null) {
            switch (endpoint.request.type.type) {
                case "fileUpload":
                    parts.push({
                        type: "line",
                        value: <CurlParameter paramKey="--data" value="@file" />,
                    });
                    break;
                case "object":
                case "reference":
                    parts.push(
                        {
                            type: "line",
                            value: (
                                <>
                                    <CurlParameter paramKey="--data" /> <JsonExampleString value="'" doNotAddQuotes />
                                </>
                            ),
                            excludeTrailingBackslash: true,
                        },
                        {
                            type: "jsx",
                            jsx: (
                                <>
                                    <JsonItemTopLine value={example.requestBody} isNonLastItemInCollection={false} />
                                    <JsonItemMiddleLines value={example.requestBody} />
                                    <JsonItemBottomLine value={example.requestBody} isNonLastItemInCollection={false} />
                                </>
                            ),
                        },
                        {
                            type: "line",
                            value: <JsonExampleString value="'" doNotAddQuotes />,
                            excludeIndent: true,
                        }
                    );
                    break;
                default:
                    assertNeverNoThrow(endpoint.request.type);
            }
        }

        const curlElement = <span className="text-yellow-400 dark:text-yellow-100">{CURL_PREFIX}</span>;
        if (parts[0]?.type === "line") {
            parts[0] = {
                ...parts[0],
                value: (
                    <>
                        {curlElement}
                        {parts[0].value}
                    </>
                ),
            };
        } else {
            parts.unshift({
                type: "line",
                value: curlElement,
            });
        }

        return parts;
    }, [
        apiDefinition.auth,
        endpoint.authed,
        endpoint.headers,
        endpoint.method,
        endpoint.queryParameters,
        endpoint.request,
        environmentUrl,
        example.headers,
        example.path,
        example.queryParameters,
        example.requestBody,
    ]);

    return (
        <JsonExampleContext.Provider value={contextValue}>
            {partsExcludingCurlCommand.map((part, index) => {
                switch (part.type) {
                    case "jsx":
                        return <React.Fragment key={index}>{part.jsx}</React.Fragment>;
                    case "line":
                        return (
                            <CurlExampleLine
                                key={index}
                                part={part}
                                indentInSpaces={index > 0 ? CURL_PREFIX.length : 0}
                                isLastPart={index === partsExcludingCurlCommand.length - 1}
                            />
                        );
                    default:
                        assertNever(part);
                }
            })}
        </JsonExampleContext.Provider>
    );
};
