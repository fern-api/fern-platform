"use client";
import dynamic from "next/dynamic";
import { memo } from "react";
import { PlaygroundButton } from "../../api-playground/PlaygroundButton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { ResolvedEndpointDefinition, ResolvedExampleEndpointCall } from "../../resolver/types";
import { AudioExample } from "../examples/AudioExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

const CodeSnippetExample = dynamic(
    () => import("../examples/CodeSnippetExample").then(({ CodeSnippetExample }) => CodeSnippetExample),
    { ssr: true },
);

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        api: string;
        endpoint: ResolvedEndpointDefinition;
        example: ResolvedExampleEndpointCall;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
        requestCodeSnippet: string;
        // requestHast: Root;
        requestCurlJson: unknown;
        responseCodeSnippet: string;
        // responseHast: Root | undefined;
        responseJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        requestHeight: number;
        responseHeight: number;
    }
}

const TITLED_EXAMPLE_PADDING = 43;

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    api,
    endpoint,
    example,
    clients,
    selectedClient,
    onClickClient,
    requestCodeSnippet,
    requestCurlJson,
    responseCodeSnippet,
    // responseHast,
    responseJson,
    hoveredRequestPropertyPath = [],
    hoveredResponsePropertyPath = [],
    requestHeight,
    responseHeight,
}) => {
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);
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
            <CodeSnippetExample
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
                // copyToClipboardText={() => requestCodeSnippet}
                actions={
                    <>
                        <PlaygroundButton
                            state={{
                                type: "endpoint",
                                api,
                                endpointId: endpoint.slug.join("/"),
                            }}
                            // example={selectedClient.exampleCall}
                        />
                        {clients.length > 1 ? (
                            <CodeExampleClientDropdown
                                clients={clients}
                                onClickClient={onClickClient}
                                selectedClient={selectedClient}
                            />
                        ) : undefined}
                    </>
                }
                code={requestCodeSnippet}
                language={selectedClient.language === "curl" ? "bash" : selectedClient.language}
                hoveredPropertyPath={selectedClient.language === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={
                    selectedClient.language === "curl" ? lineNumberOf(requestCodeSnippet, "-d '{") : undefined
                }
                scrollAreaStyle={{ height: requestHeight - TITLED_EXAMPLE_PADDING }}
            />
            {endpoint.responseBody?.shape.type === "fileDownload" && <AudioExample title="Response" type={"primary"} />}
            {example.responseBody != null && endpoint.responseBody?.shape.type !== "fileDownload" && (
                <CodeSnippetExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                    type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    code={responseCodeSnippet}
                    language="json"
                    hoveredPropertyPath={hoveredResponsePropertyPath}
                    json={responseJson}
                    scrollAreaStyle={{ height: responseHeight - TITLED_EXAMPLE_PADDING }}
                />
            )}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);
