"use client";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { isPlainObject } from "@fern-ui/core-utils";
import jp from "jsonpath";
import { createRef, memo, useEffect, useMemo } from "react";
import { ApiPlaygroundButton } from "../../api-playground/ApiPlaygroundButton";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { FernScrollArea } from "../../components/FernScrollArea";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "../../util/resolver";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { JsonPropertyPath, JsonPropertyPathPart } from "../examples/JsonPropertyPath";
import { TitledExample } from "../examples/TitledExample";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        endpoint: ResolvedEndpointDefinition;
        example: APIV1Read.ExampleEndpointCall;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
        requestCurlString: string;
        requestCurlJson: unknown;
        responseJsonString: string;
        responseJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        requestHeight: number;
        responseHeight: number;
    }
}

const TITLED_EXAMPLE_PADDING = 43;

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    apiSection,
    endpoint,
    example,
    clients,
    selectedClient,
    onClickClient,
    requestCurlString,
    requestCurlJson,
    responseJsonString,
    responseJson,
    hoveredRequestPropertyPath = [],
    hoveredResponsePropertyPath = [],
    requestHeight,
    responseHeight,
}) => {
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);

    const requestHighlightLines = useMemo(() => {
        if (hoveredRequestPropertyPath.length === 0) {
            return [];
        }
        const startLine = lineNumberOf(requestCurlString, "-d '{");
        if (startLine === -1) {
            return [];
        }
        return getJsonLineNumbers(requestCurlJson, hoveredRequestPropertyPath, startLine);
    }, [hoveredRequestPropertyPath, requestCurlJson, requestCurlString]);

    const responseHighlightLines = useMemo(() => {
        if (hoveredResponsePropertyPath.length === 0) {
            return [];
        }
        return getJsonLineNumbers(responseJson, hoveredResponsePropertyPath);
    }, [hoveredResponsePropertyPath, responseJson]);

    const requestViewportRef = createRef<HTMLDivElement>();
    const responseViewportRef = createRef<HTMLDivElement>();

    useEffect(() => {
        if (requestViewportRef.current != null && requestHighlightLines[0] != null) {
            const lineNumber = Array.isArray(requestHighlightLines[0])
                ? requestHighlightLines[0][0]
                : requestHighlightLines[0];
            const offsetTop = lineNumber * 20 - 14;
            requestViewportRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    }, [requestHighlightLines, requestViewportRef]);

    useEffect(() => {
        if (responseViewportRef.current != null && responseHighlightLines[0] != null) {
            const lineNumber = Array.isArray(responseHighlightLines[0])
                ? responseHighlightLines[0][0]
                : responseHighlightLines[0];
            const offsetTop = lineNumber * 20 - 14;
            responseViewportRef.current.scrollTo({ top: offsetTop, behavior: "smooth" });
        }
    }, [responseHighlightLines, responseViewportRef]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col gap-6">
            {selectedClientGroup != null && selectedClientGroup.examples.length > 1 && (
                <FernButtonGroup className="min-w-0 shrink">
                    {selectedClientGroup?.examples.map((example) => (
                        <FernButton
                            key={example.key}
                            rounded={true}
                            onClick={() => {
                                onClickClient(example);
                            }}
                            className="min-w-0 shrink truncate"
                            mono
                            size="small"
                            variant={example === selectedClient ? "outlined" : "minimal"}
                            intent={example === selectedClient ? "primary" : "none"}
                        >
                            {example.name}
                        </FernButton>
                    ))}
                </FernButtonGroup>
            )}
            <TitledExample
                title={
                    <EndpointUrlWithOverflow
                        path={endpoint.path}
                        method={endpoint.method}
                        environment={endpoint.defaultEnvironment?.baseUrl}
                    />
                }
                // afterTitle={<span className="t-accent mx-1 px-1 text-xs">{selectedClient.name}</span>}
                type="primary"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                disablePadding={true}
                copyToClipboardText={() => {
                    return selectedClient.language === "curl" && selectedClient.code === ""
                        ? requestCurlString
                        : selectedClient.code;
                }}
                actions={
                    <>
                        <ApiPlaygroundButton
                            api={apiSection.api}
                            endpointId={endpoint.slug.join("/")}
                            // example={selectedClient.exampleCall}
                        />
                        {clients.length > 1 ? (
                            <CodeExampleClientDropdown
                                clients={clients}
                                onClickClient={onClickClient}
                                selectedClient={selectedClient}
                                route={"/" + endpoint.slug.join("/")}
                            />
                        ) : undefined}
                    </>
                }
            >
                <FernScrollArea
                    style={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}
                    viewportRef={requestViewportRef}
                >
                    <CodeBlockSkeleton
                        content={
                            selectedClient.language === "curl" && selectedClient.code === ""
                                ? requestCurlString
                                : selectedClient.code
                        }
                        language={selectedClient.language === "curl" ? "bash" : selectedClient.language}
                        fontSize="sm"
                        highlightLines={requestHighlightLines}
                    />
                </FernScrollArea>
            </TitledExample>
            {example.responseBodyV3 != null && (
                <TitledExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                    type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    copyToClipboardText={() => responseJsonString}
                    disablePadding={true}
                >
                    <FernScrollArea
                        style={{ maxHeight: responseHeight - TITLED_EXAMPLE_PADDING }}
                        viewportRef={responseViewportRef}
                    >
                        <CodeBlockSkeleton
                            content={responseJsonString}
                            language="json"
                            fontSize="sm"
                            highlightLines={responseHighlightLines}
                        />
                    </FernScrollArea>
                </TitledExample>
            )}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);

export function getJsonLineNumbers(json: unknown, path: JsonPropertyPath, start = 0): (number | [number, number])[] {
    const jsonString = JSON.stringify(json, undefined, 2);
    const part = path[0];
    if (part == null) {
        const length = jsonString.split("\n").length;
        return length === 0 ? [] : length === 1 ? [start] : [[start, start + length - 1]];
    }

    const query = "$" + getQueryPart(part);

    const results = jp.query(json, query);

    if (part.type === "objectFilter") {
        if (isPlainObject(json) && json[part.propertyName] === part.requiredValue) {
            return getJsonLineNumbers(json, path.slice(1), start);
        }
    }

    return results.flatMap((result) => {
        // get start of string by matching
        const toMatch = jsonStringifyAndIndent(
            result,
            part.type === "objectProperty" ? part.propertyName : undefined,
            1,
        );
        const startLine = lineNumberOf(jsonString, toMatch);
        if (startLine === -1) {
            return [];
        }

        return getJsonLineNumbers(result, path.slice(1), startLine).map((line) =>
            typeof line === "number" ? start + line : [start + line[0], start + line[1]],
        );
    });
}

export function lineNumberOf(a: string, match: string): number {
    const startChar = a.indexOf(match);
    if (startChar === -1) {
        return -1;
    }

    return a.slice(0, startChar).split("\n").length - 1;
}

function jsonStringifyAndIndent(json: unknown, key: string | undefined, depth: number) {
    let jsonString = JSON.stringify(json, undefined, 2);
    if (key != null) {
        jsonString = `"${key}": ${jsonString}`;
    }
    return jsonString
        .split("\n")
        .map((line) => "  ".repeat(depth) + line)
        .join("\n");
}

function getQueryPart(path: JsonPropertyPathPart) {
    switch (path.type) {
        case "objectProperty":
            return "." + path.propertyName;
        case "listItem":
            return "[*]";
        case "objectFilter":
            return `[?(@.${path.propertyName}=='${path.requiredValue}')]`;
    }
}
