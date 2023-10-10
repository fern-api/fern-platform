"use client";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { memo, useMemo, useState } from "react";
import { CurlExample } from "../examples/curl-example/CurlExample";
import type { CodeExampleClient } from "../examples/code-example";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { CurlLine } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { JsonLine } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
import { type Theme } from "@fern-ui/theme";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        theme?: Theme;
        example: FernRegistryApiRead.ExampleEndpointCall;
        requestCurlLines: CurlLine[];
        responseJsonLines: JsonLine[];
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        requestHeight: number;
        responseHeight: number;
    }
}

const TITLED_EXAMPLE_PADDING = 43;

const DEFAULT_CLIENT: CodeExampleClient = {
    id: "curl",
    name: "Curl",
};

function getAvailableExampleClients(example: FernRegistryApiRead.ExampleEndpointCall): CodeExampleClient[] {
    const clients: CodeExampleClient[] = [DEFAULT_CLIENT];
    const { pythonSdk } = example.codeExamples;
    if (pythonSdk != null) {
        clients.push(
            {
                id: "python",
                name: "Python",
                language: "python",
                example: pythonSdk.sync_client,
            },
            {
                id: "python-async",
                name: "Python (Async)",
                language: "python",
                example: pythonSdk.async_client,
            }
        );
    }
    return clients;
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    theme,
    example,
    requestCurlLines,
    responseJsonLines,
    hoveredRequestPropertyPath,
    hoveredResponsePropertyPath,
    requestHeight,
    responseHeight,
}) => {
    const [selectedClient, setSelectedClient] = useState<CodeExampleClient>(DEFAULT_CLIENT);
    const availableClients = useMemo(() => getAvailableExampleClients(example), [example]);

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
                    // TODO
                    return "";
                }}
                actions={
                    availableClients.length > 1 ? (
                        <CodeExampleClientDropdown
                            clients={availableClients}
                            onClickClient={(clientId) => {
                                const client = availableClients.find((c) => c.id === clientId);
                                if (client != null) {
                                    setSelectedClient(client);
                                }
                            }}
                            selectedClient={selectedClient}
                        />
                    ) : undefined
                }
            >
                {selectedClient.id === "curl" ? (
                    <CurlExample
                        curlLines={requestCurlLines}
                        selectedProperty={hoveredRequestPropertyPath}
                        height={requestHeight - TITLED_EXAMPLE_PADDING}
                    />
                ) : (
                    <CodeBlockSkeleton
                        className="rounded-b-x w-0 min-w-full overflow-y-auto pt-1.5"
                        content={selectedClient.example}
                        language={selectedClient.language}
                        theme={theme}
                        usePlainStyles
                        style={{ height: requestHeight - TITLED_EXAMPLE_PADDING }}
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
