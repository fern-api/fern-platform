"use client";
import clsx from "clsx";
import { memo } from "react";
import { PlaygroundButton } from "../../api-playground/PlaygroundButton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { ResolvedEndpointDefinition, ResolvedExampleEndpointCall } from "../../util/resolver";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";

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
}) => {
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 shrink flex-col gap-6">
            {selectedClientGroup != null && selectedClientGroup.examples.length > 1 && (
                <FernButtonGroup className="min-w-0 shrink-0">
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
                className={clsx("min-h-0 flex-initial")}
                title={
                    <EndpointUrlWithOverflow
                        className="-m-1"
                        path={endpoint.path}
                        method={endpoint.method}
                        environment={endpoint.defaultEnvironment?.baseUrl}
                    />
                }
                actions={
                    <>
                        <PlaygroundButton
                            state={{
                                type: "endpoint",
                                api,
                                endpointId: endpoint.slug.join("/"),
                            }}
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
            />
            {example.responseBody != null &&
                (endpoint.responseBody?.shape.type === "fileDownload" ? (
                    <AudioExample title="Response" type={"primary"} />
                ) : (
                    <CodeSnippetExample
                        className={clsx("min-h-0 flex-initial")}
                        title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                        intent={example.responseStatusCode >= 400 ? "danger" : "none"}
                        code={responseCodeSnippet}
                        language="json"
                        hoveredPropertyPath={hoveredResponsePropertyPath}
                        json={responseJson}
                    />
                ))}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);
