"use client";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { memo } from "react";
import { CurlExample } from "../examples/curl-example/CurlExample";
import { CurlLine } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { JsonLine } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
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

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    example,
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
                    // TODO
                    return "";
                }}
            >
                <CurlExample
                    curlLines={requestCurlLines}
                    selectedProperty={hoveredRequestPropertyPath}
                    height={requestHeight - TITLED_EXAMPLE_PADDING}
                />
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
