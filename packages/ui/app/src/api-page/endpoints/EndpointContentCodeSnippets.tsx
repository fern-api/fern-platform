"use client";
import * as FernRegistryApiRead from "@fern-api/fdr-sdk/dist/generated/api/resources/api/resources/v1/resources/read";
import { type Theme } from "@fern-ui/theme";
import dynamic from "next/dynamic";
import { memo } from "react";
import type { CodeExampleClient } from "../examples/code-example";
import { CurlExample } from "../examples/curl-example/CurlExample";
import { CurlLine, curlLinesToString } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { JsonLine } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";

const CodeBlockSkeleton = dynamic(
    () => import("../../commons/CodeBlockSkeleton").then(({ CodeBlockSkeleton }) => CodeBlockSkeleton),
    { ssr: false }
);

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        theme?: Theme;
        example: FernRegistryApiRead.ExampleEndpointCall;
        availableExampleClients: CodeExampleClient[];
        selectedExampleClient: CodeExampleClient;
        onClickExampleClient: (client: CodeExampleClient) => void;
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
                    availableExampleClients.length > 1 ? (
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
                    ) : undefined
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
                        fontSize="sm"
                        style={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}
                    />
                )}
            </TitledExample>
            {example.responseBody != null && (
                <TitledExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
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
