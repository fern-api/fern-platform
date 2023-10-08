import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointTitleAsString, getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import useSize from "@react-hook/size";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { HEADER_HEIGHT } from "../../constants";
import { ApiPageDescription } from "../ApiPageDescription";
import { CurlExample } from "../examples/curl-example/CurlExample";
import { getCurlLines } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { JsonExampleVirtualized } from "../examples/json-example/JsonExample";
import { flattenJsonToLines } from "../examples/json-example/jsonLineUtils";
import { TitledExample } from "../examples/TitledExample";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointErrorsSection } from "./EndpointErrorsSection";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { EndpointUrl } from "./EndpointUrl";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

const URL_OVERFLOW_THRESHOLD = 0.95;

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

export const EndpointContent = React.memo<EndpointContent.Props>(function EndpointContent({
    endpoint,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
    anchorIdParts,
}) {
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

    const endpointUrlOuterContainerRef = useRef<null | HTMLDivElement>(null);
    const endpointUrlInnerContainerRef = useRef<null | HTMLDivElement>(null);
    const [endpointUrlOuterContainerWidth] = useSize(endpointUrlOuterContainerRef);
    const [endpointUrlInnerContainerWidth] = useSize(endpointUrlInnerContainerRef);
    const isUrlAboutToOverflow =
        endpointUrlInnerContainerWidth / endpointUrlOuterContainerWidth > URL_OVERFLOW_THRESHOLD;

    const [selectedErrorIndex, setSelectedErrorIndex] = useState<number | null>(null);
    const selectedError = selectedErrorIndex == null ? null : endpoint.errors[selectedErrorIndex] ?? null;
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

    const [[requestHeight, responseHeight], setExampleHeights] = useState<[number, number]>(calculateEndpointHeights);

    useEffect(() => {
        if (typeof window === "undefined") {
            const updateExampleHeights = () => {
                setExampleHeights(calculateEndpointHeights());
            };

            window.addEventListener("resize", updateExampleHeights);
            return () => {
                window.removeEventListener("resize", updateExampleHeights);
            };
        }
        return;
    }, [calculateEndpointHeights]);

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
                        minHeight: `${requestHeight + responseHeight + GAP_6 + 70}px`,
                    }}
                >
                    <div className="pb-2 pt-8">
                        {isSubpackage(package_) && (
                            <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                                {getSubpackageTitle(package_)}
                            </div>
                        )}
                        <div>
                            <span className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                                {getEndpointTitleAsString(endpoint)}
                            </span>
                            {endpoint.availability != null && (
                                <span className="relative">
                                    <EndpointAvailabilityTag
                                        className="absolute -top-1.5 left-2.5 inline-block"
                                        availability={endpoint.availability}
                                    />
                                </span>
                            )}
                        </div>
                    </div>
                    <div ref={endpointUrlOuterContainerRef} className="flex max-w-full flex-col items-start">
                        <EndpointUrl
                            ref={endpointUrlInnerContainerRef}
                            className="max-w-full"
                            urlStyle={isUrlAboutToOverflow ? "overflow" : "default"}
                            endpoint={endpoint}
                        />
                    </div>
                    <ApiPageDescription className="mt-3" description={endpoint.description} isMarkdown={true} />
                    <div className="mt-8 flex">
                        <div className="flex flex-1 flex-col gap-12">
                            {endpoint.path.pathParameters.length > 0 && (
                                <PathParametersSection
                                    pathParameters={endpoint.path.pathParameters}
                                    anchorIdParts={[...anchorIdParts, "path"]}
                                />
                            )}
                            {endpoint.queryParameters.length > 0 && (
                                <QueryParametersSection
                                    queryParameters={endpoint.queryParameters}
                                    anchorIdParts={[...anchorIdParts, "query"]}
                                />
                            )}
                            {endpoint.request != null && (
                                <EndpointSection title="Request" anchorIdParts={[...anchorIdParts, "request"]}>
                                    <EndpointRequestSection
                                        httpRequest={endpoint.request}
                                        onHoverProperty={onHoverRequestProperty}
                                        anchorIdParts={[...anchorIdParts, "request"]}
                                    />
                                </EndpointSection>
                            )}
                            {endpoint.response != null && (
                                <EndpointSection title="Response" anchorIdParts={[...anchorIdParts, "response"]}>
                                    <EndpointResponseSection
                                        httpResponse={endpoint.response}
                                        onHoverProperty={onHoverResponseProperty}
                                        anchorIdParts={[...anchorIdParts, "response"]}
                                    />
                                </EndpointSection>
                            )}
                            {apiSection.showErrors && endpoint.errors.length > 0 && (
                                <EndpointSection title="Errors" anchorIdParts={[...anchorIdParts, "response"]}>
                                    <EndpointErrorsSection
                                        errors={endpoint.errors}
                                        onClickError={(_, idx, event) => {
                                            event.stopPropagation();
                                            setSelectedErrorIndex(idx);
                                        }}
                                        selectError={(_, idx) => setSelectedErrorIndex(idx)}
                                        onHoverProperty={onHoverResponseProperty}
                                        selectedErrorIndex={selectedErrorIndex}
                                        anchorIdParts={[...anchorIdParts, "errors"]}
                                    />
                                </EndpointSection>
                            )}
                        </div>
                    </div>
                </div>

                {isInViewport && (
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
                    >
                        {example ? (
                            <div className="flex min-h-0 flex-1 flex-col">
                                <div className="grid min-h-0 flex-1 flex-col gap-6">
                                    <TitledExample
                                        title="Request"
                                        type="primary"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                        }}
                                        disablePadding={true}
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
                                            copyToClipboardText={() =>
                                                JSON.stringify(example.responseBody, undefined, 2)
                                            }
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
                        ) : null}
                    </div>
                )}
            </div>
        </div>
    );
});
