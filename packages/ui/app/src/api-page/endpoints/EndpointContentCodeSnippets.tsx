"use client";
import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import classNames from "classnames";
import { memo } from "react";
import { ApiPlaygroundButton } from "../../api-playground/ApiPlaygroundButton";
import { CodeBlockSkeleton } from "../../commons/CodeBlockSkeleton";
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
    apiDefinition,
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
                <div className="flex min-w-0 shrink gap-2">
                    {selectedClientGroup?.examples.map((example) => (
                        <button
                            key={example.key}
                            className={classNames("h-6 px-3 rounded-xl shrink min-w-0", {
                                "bg-background dark:bg-background-dark ring-1 ring-border-primary dark:ring-border-primary-dark":
                                    example.key === selectedClient.key,
                                "bg-background/50 dark:bg-background-dark/50 hover:bg-background dark:hover:bg-background-dark":
                                    example.key !== selectedClient.key,
                            })}
                            onClick={() => {
                                onClickClient(example);
                            }}
                        >
                            <span className="block overflow-hidden truncate font-mono text-xs font-normal">
                                {example.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            <TitledExample
                title="Request"
                // afterTitle={<span className="text-accent-primary mx-1 px-1 text-xs">{selectedClient.name}</span>}
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
                            endpoint={endpoint}
                            apiSection={apiSection}
                            apiDefinition={apiDefinition}
                            example={selectedClient.exampleCall}
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
                    <CodeBlockSkeleton
                        className="rounded-b-x w-0 min-w-full overflow-y-auto pt-1.5"
                        content={selectedClient.code}
                        language={selectedClient.language}
                        usePlainStyles
                        fontSize="sm"
                        style={{ maxHeight: requestHeight - TITLED_EXAMPLE_PADDING }}
                    />
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
