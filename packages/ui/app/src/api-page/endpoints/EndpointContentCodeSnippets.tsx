"use client";
import { APIV1Read } from "@fern-api/fdr-sdk";
import { memo } from "react";
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
import { CurlExample } from "../examples/curl-example/CurlExample";
import { CurlLine, curlLinesToString } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { JsonLine } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        endpoint: ResolvedEndpointDefinition;
        example: APIV1Read.ExampleEndpointCall;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
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
    apiSection,
    endpoint,
    example,
    clients,
    selectedClient,
    onClickClient,
    requestCurlLines,
    responseJsonLines,
    hoveredRequestPropertyPath,
    hoveredResponsePropertyPath,
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
            <TitledExample
                title="Request"
                // afterTitle={<span className="t-accent mx-1 px-1 text-xs">{selectedClient.name}</span>}
                type="primary"
                onClick={(e) => {
                    e.stopPropagation();
                }}
                disablePadding={true}
                copyToClipboardText={() => {
                    return selectedClient.language === "curl" && selectedClient.code === ""
                        ? curlLinesToString(requestCurlLines)
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
                            />
                        ) : undefined}
                    </>
                }
            >
                {selectedClient.language === "curl" && selectedClient.code === "" ? (
                    <CurlExample
                        curlLines={requestCurlLines}
                        selectedProperty={hoveredRequestPropertyPath}
                        height={requestHeight - TITLED_EXAMPLE_PADDING}
                    />
                ) : (
                    <FernScrollArea style={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}>
                        <CodeBlockSkeleton
                            content={selectedClient.code}
                            language={selectedClient.language}
                            fontSize="sm"
                        />
                    </FernScrollArea>
                )}
            </TitledExample>
            {example.responseBodyV3 != null && (
                <TitledExample
                    title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                    type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    copyToClipboardText={() => JSON.stringify(example.responseBodyV3?.value, undefined, 2)}
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
