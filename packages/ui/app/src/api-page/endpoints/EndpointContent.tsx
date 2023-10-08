import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { HEADER_HEIGHT } from "../../constants";
import { useLayoutBreakpoint } from "../../docs-context/useLayoutBreakpoint";
import { CurlExample } from "../examples/curl-example/CurlExample";
import { getCurlLines } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { flattenJsonToLines } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { EndpointContentLeft } from "./EndpointContentLeft";

export declare namespace EndpointContent {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        anchorIdParts: string[];
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
    }
}

const GAP_6 = 24;
const TITLED_EXAMPLE_PADDING = 43;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const LINE_HEIGHT = 21.5;

export const EndpointContent: React.FC<EndpointContent.Props> = ({
    endpoint,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
    anchorIdParts,
}) => {
    const layoutBreakpoint = useLayoutBreakpoint();
    const [isInViewport, setIsInViewport] = useState(false);
    const { ref: containerRef } = useInView({
        onChange: setIsInViewport,
        rootMargin: "100%",
    });
    const { apiSection, apiDefinition } = useApiDefinitionContext();
    const [hoveredRequestPropertyPath, setHoveredRequestPropertyPath] = useState<JsonPropertyPath | undefined>();
    const [hoveredResponsePropertyPath, setHoveredResponsePropertyPath] = useState<JsonPropertyPath | undefined>();
    const onHoverRequestProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredRequestPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredRequestPropertyPath]
    );
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    const [selectedErrorIndex, setSelectedErrorIndex] = useState<number | null>(null);

    const errors = useMemo(() => {
        return [...(endpoint.errorsV2 ?? [])]
            .sort((e1, e2) => (e1.name != null && e2.name != null ? e1.name.localeCompare(e2.name) : 0))
            .sort((e1, e2) => e1.statusCode - e2.statusCode);
    }, [endpoint.errorsV2]);

    const selectedError = selectedErrorIndex == null ? null : errors[selectedErrorIndex] ?? null;
    const example = useMemo(() => {
        if (selectedError == null) {
            // Look for success example
            return endpoint.examples.find((e) => e.responseStatusCode >= 200 && e.responseStatusCode < 300) ?? null;
        }
        return endpoint.examples.find((e) => e.responseStatusCode === selectedError.statusCode) ?? null;
    }, [endpoint.examples, selectedError]);

    const curlLines = useMemo(
        () =>
            example != null
                ? getCurlLines(apiDefinition, endpoint, example, flattenJsonToLines(example.requestBody))
                : [],
        [apiDefinition, endpoint, example]
    );
    const jsonLines = useMemo(() => flattenJsonToLines(example?.responseBody), [example?.responseBody]);

    const calculateEndpointHeights = useCallback((): [number, number] => {
        if (typeof window === "undefined") {
            return [0, 0];
        }
        const containerHeight = window.innerHeight - HEADER_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
        const requestContentHeight = curlLines.length * LINE_HEIGHT + 40 + TITLED_EXAMPLE_PADDING;
        const responseContentHeight = jsonLines.length * LINE_HEIGHT + 40 + TITLED_EXAMPLE_PADDING;
        const halfContainerHeight = (containerHeight - GAP_6) / 2;
        if (example?.responseBody == null) {
            return [Math.min(requestContentHeight, containerHeight), 0];
        }
        if (requestContentHeight >= halfContainerHeight && responseContentHeight >= halfContainerHeight) {
            return [halfContainerHeight, halfContainerHeight];
        } else if (requestContentHeight + responseContentHeight <= containerHeight - GAP_6) {
            return [requestContentHeight, responseContentHeight];
        } else if (requestContentHeight < halfContainerHeight) {
            const remainingContainerHeight = containerHeight - requestContentHeight - GAP_6;
            return [requestContentHeight, Math.min(remainingContainerHeight, responseContentHeight)];
        } else if (responseContentHeight < halfContainerHeight) {
            const remainingContainerHeight = containerHeight - responseContentHeight - GAP_6;
            return [Math.min(remainingContainerHeight, requestContentHeight), responseContentHeight];
        } else {
            return [0, 0];
        }
    }, [curlLines.length, example?.responseBody, jsonLines.length]);

    const [[requestHeight, responseHeight], setExampleHeights] = useState<[number, number]>([0, 0]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const handleResize = () => {
                setExampleHeights(calculateEndpointHeights());
            };

            window.addEventListener("resize", handleResize);

            handleResize();
            return () => {
                window.removeEventListener("resize", handleResize);
            };
        }
        return;
    }, [calculateEndpointHeights]);

    const renderExample = () => {
        if (example == null) {
            return null;
        }

        return (
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 flex-col gap-6">
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
                            curlLines={curlLines}
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
                                jsonLines={jsonLines}
                                selectedProperty={hoveredResponsePropertyPath}
                                height={responseHeight - TITLED_EXAMPLE_PADDING}
                            />
                        </TitledExample>
                    )}
                </div>
            </div>
        );
    };

    const exampleHeight = requestHeight + responseHeight + GAP_6 + 70;

    return (
        <div
            className={classNames("pb-20 pl-6 md:pl-12 pr-4", {
                "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
            })}
            onClick={() => setSelectedErrorIndex(null)}
            ref={containerRef}
        >
            <div
                className="flex min-w-0 flex-1 flex-col justify-between lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
            >
                <div
                    className="flex min-w-0 max-w-2xl flex-1 flex-col"
                    style={{
                        minHeight: layoutBreakpoint === "lg" ? `${exampleHeight}px` : undefined,
                    }}
                >
                    <EndpointContentLeft
                        endpoint={endpoint}
                        package={package_}
                        anchorIdParts={anchorIdParts}
                        apiSection={apiSection}
                        onHoverRequestProperty={onHoverRequestProperty}
                        onHoverResponseProperty={onHoverResponseProperty}
                        errors={errors}
                        selectedErrorIndex={selectedErrorIndex}
                        setSelectedErrorIndex={setSelectedErrorIndex}
                    />
                </div>

                <div style={{ height: `${exampleHeight}px` }} />

                <div
                    className={classNames(
                        "lg:flex-1 lg:sticky lg:self-start lg:min-w-sm lg:max-w-lg lg:ml-auto",
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[150vh] lg:max-h-[calc(100vh-4rem)]",
                        "flex",
                        // header offset
                        "mt-10 lg:mt-0 lg:top-16"
                    )}
                    style={{ height: layoutBreakpoint !== "lg" ? `${exampleHeight}px` : undefined }}
                >
                    {isInViewport && renderExample()}
                </div>
            </div>
        </div>
    );
};
