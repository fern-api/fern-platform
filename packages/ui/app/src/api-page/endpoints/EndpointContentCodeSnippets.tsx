"use client";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { memo } from "react";
import { ApiPlaygroundButton } from "../../api-playground/ApiPlaygroundButton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "../../util/resolver";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { CodeSnippetExample, lineNumberOf } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
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
                content={
                    selectedClient.language === "curl" && selectedClient.code === ""
                        ? requestCurlString
                        : selectedClient.code
                }
                language={selectedClient.language === "curl" ? "bash" : selectedClient.language}
                hoveredPropertyPath={selectedClient.language === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={lineNumberOf(requestCurlString, "-d '{")}
                scrollAreaStyle={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}
            />
            {example.responseBodyV3 != null && (
                <CodeSnippetExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                    type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    copyToClipboardText={() => responseJsonString}
                    content={responseJsonString}
                    language="json"
                    hoveredPropertyPath={hoveredResponsePropertyPath}
                    json={responseJson}
                    scrollAreaStyle={{ maxHeight: responseHeight - TITLED_EXAMPLE_PADDING }}
                />
            )}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);
