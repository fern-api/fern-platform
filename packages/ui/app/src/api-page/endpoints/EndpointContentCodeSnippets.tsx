"use client";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { type Theme } from "@fern-ui/theme";
import classNames from "classnames";
import { memo } from "react";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import type { CodeExampleClient } from "../examples/code-example";
import { CurlExample } from "../examples/curl-example/CurlExample";
import { CurlLine, curlLinesToString } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { JsonLine } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        theme?: Theme;
        example: FernRegistryApiRead.ExampleEndpointCall;
        availableExampleClients: CodeExampleClient[];
        selectedExampleClient: CodeExampleClient;
        onClickExampleClient: (client: CodeExampleClient) => void;
        requestMethod: string;
        requestCurlLines: CurlLine[];
        responseJsonLines: JsonLine[];
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        requestHeight: number;
        responseHeight: number;
    }
}

const TITLED_EXAMPLE_PADDING = 43;

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    theme,
    example,
    availableExampleClients,
    selectedExampleClient,
    onClickExampleClient,
    requestMethod,
    requestCurlLines,
    responseJsonLines,
    hoveredRequestPropertyPath,
    hoveredResponsePropertyPath,
    requestHeight,
    responseHeight,
}) => {
    return (
        <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] gap-6">
            <TitledExample
                title="Request"
                tag={requestMethod}
                type="primary"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                disablePadding={true}
                copyToClipboardText={() => {
                    return selectedExampleClient.id === "curl"
                        ? curlLinesToString(requestCurlLines)
                        : selectedExampleClient.example;
                }}
                actions={
                    <>
                        {availableExampleClients.length > 1 && (
                            <CodeExampleClientDropdown
                                clients={availableExampleClients}
                                onClickClient={(clientId) => {
                                    const client = availableExampleClients.find((c) => c.id === clientId);
                                    if (client != null) {
                                        onClickExampleClient(client);
                                    }
                                }}
                                selectedClient={selectedExampleClient}
                            />
                        )}
                        <button
                            className={classNames(
                                "group inline-flex w-full justify-center items-center space-x-2 rounded-lg",
                                "hover:bg-tag-primary",
                                "border border-gray-100/90 dark:border-white/20 hover:border-2 hover:border-border-primary hover:dark:border-border-primary",
                                "transition",
                                "dark:text-white hover:text-accent-primary hover:dark:text-accent-primary tracking-tight",
                                "py-1 px-2.5",
                                // Make sure padding remains the same on hover
                                // This seems to be a Tailwind bug where we can't use theme(borderWidth.1) in some cases
                                // Current workaround is to hardcode 1px
                                "hover:py-[calc(theme(spacing.1)-1px)] hover:px-[calc(theme(spacing[2.5])-1px)]"
                            )}
                        >
                            <span className="font-mono text-xs font-normal transition-colors">Playground</span>
                        </button>
                    </>
                }
            >
                {selectedExampleClient.id === "curl" ? (
                    <CurlExample
                        curlLines={requestCurlLines}
                        selectedProperty={hoveredRequestPropertyPath}
                        height={requestHeight - TITLED_EXAMPLE_PADDING}
                    />
                ) : (
                    <CodeBlockSkeleton
                        className="rounded-b-x w-0 min-w-full overflow-y-auto pt-1.5"
                        content={selectedExampleClient.example}
                        language={selectedExampleClient.language}
                        theme={theme}
                        usePlainStyles
                        style={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}
                    />
                )}
            </TitledExample>
            {example.responseBody != null && (
                <TitledExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                    tag={`${example.responseStatusCode}`}
                    type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    copyToClipboardText={() => JSON.stringify(example.responseBody, undefined, 2)}
                    disablePadding={true}
                >
                    <JsonExampleVirtualized
                        jsonLines={responseJsonLines}
                        selectedProperty={hoveredResponsePropertyPath}
                        height={responseHeight - TITLED_EXAMPLE_PADDING}
                    />
                </TitledExample>
            )}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);
