"use client";
import { memo } from "react";
import { PlaygroundButton } from "../../api-playground/PlaygroundButton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { ResolvedEndpointDefinition, ResolvedError, ResolvedExampleEndpointCall } from "../../resolver/types";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { getSuccessMessageForStatus } from "../utils/getSuccessMessageForStatus";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorCodeSnippetExample } from "./ErrorCodeSnippetExample";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        api: string;
        endpoint: ResolvedEndpointDefinition;
        example: ResolvedExampleEndpointCall;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
        requestCodeSnippet: string;
        requestCurlJson: unknown;
        responseCodeSnippet: string;
        responseJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        requestHeight: number;
        responseHeight: number;
        selectedError: ResolvedError | undefined;
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
    responseJson,
    hoveredRequestPropertyPath = [],
    hoveredResponsePropertyPath = [],
    selectedError,
}) => {
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);
    return (
        <div className="gap-6 grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] grid-rows w-full">
            {/* TODO: Replace this with a proper segmented control component */}
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
                onClick={(e) => {
                    e.stopPropagation();
                }}
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
                language={selectedClient.language}
                hoveredPropertyPath={selectedClient.language === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={
                    selectedClient.language === "curl" ? lineNumberOf(requestCodeSnippet, "-d '{") : undefined
                }
            />
            {endpoint.responseBody?.shape.type === "fileDownload" && <AudioExample title="Response" />}

            {example.responseBody != null &&
                endpoint.responseBody?.shape.type !== "fileDownload" &&
                (selectedError == null ? (
                    <CodeSnippetExample
                        title={
                            <div className="text-sm px-1 t-muted">
                                Response -{" "}
                                <span className="text-intent-success">
                                    {endpoint.responseBody?.statusCode +
                                        " " +
                                        getSuccessMessageForStatus(
                                            endpoint.responseBody?.statusCode as number,
                                            endpoint.method,
                                        )}
                                </span>
                            </div>
                        }
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                        code={responseCodeSnippet}
                        language="json"
                        hoveredPropertyPath={hoveredResponsePropertyPath}
                        json={responseJson}
                    />
                ) : (
                    <ErrorCodeSnippetExample resolvedError={selectedError} defaultValue={responseJson} />
                ))}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);
