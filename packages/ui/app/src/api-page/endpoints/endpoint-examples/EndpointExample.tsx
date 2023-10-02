import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback, useEffect, useRef, useState } from "react";
import { CurlExample } from "../../examples/curl-example/CurlExample";
import { JsonExample } from "../../examples/json-example/JsonExample";
import { TitledExample } from "../../examples/TitledExample";
import { useEndpointContext } from "../endpoint-context/useEndpointContext";

export declare namespace EndpointExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
    }
}

const GAP_6 = 24;
const HEADER_HEIGHT = 63;
const EXAMPLE_TITLE_HEIGHT = 40;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const TITLED_EXAMPLE_BORDERS = 3;

export const EndpointExample: React.FC<EndpointExample.Props> = ({ endpoint, example }) => {
    const { hoveredRequestPropertyPath, hoveredResponsePropertyPath } = useEndpointContext();
    const requestRef = useRef<null | HTMLDivElement>(null);

    const [maxRemainingSize, setMaxRemainingSize] = useState(0);
    const calcAndSetMaxRemainingSize = useCallback(() => {
        const containerHeight =
            window.innerHeight - HEADER_HEIGHT - PADDING_TOP - PADDING_BOTTOM - TITLED_EXAMPLE_BORDERS;
        const requestHeight = requestRef.current?.getBoundingClientRect().height;
        if (requestHeight != null) {
            setMaxRemainingSize(containerHeight - requestHeight - GAP_6 - EXAMPLE_TITLE_HEIGHT);
        }
    }, []);
    useEffect(() => {
        if (window != null) {
            calcAndSetMaxRemainingSize();
            window.addEventListener("resize", calcAndSetMaxRemainingSize);
            return () => {
                window.removeEventListener("resize", calcAndSetMaxRemainingSize);
            };
        }
        return undefined;
    });

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] flex-col gap-6">
                <TitledExample
                    title="Request"
                    type="primary"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    containerRef={requestRef}
                >
                    {(parent) => (
                        <CurlExample
                            endpoint={endpoint}
                            example={example}
                            selectedProperty={hoveredRequestPropertyPath}
                            parent={parent}
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
                    >
                        <JsonExample
                            json={example.responseBody}
                            selectedProperty={hoveredResponsePropertyPath}
                            maxContentHeight={maxRemainingSize}
                        />
                    </TitledExample>
                )}
            </div>
        </div>
    );
};
