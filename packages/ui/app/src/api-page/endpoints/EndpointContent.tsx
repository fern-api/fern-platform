import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { getEndpointTitleAsString, getSubpackageTitle, isSubpackage } from "@fern-ui/app-utils";
import useSize from "@react-hook/size";
import classNames from "classnames";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ApiPageDescription } from "../ApiPageDescription";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { useEndpointContext } from "./endpoint-context/useEndpointContext";
import { EndpointExample } from "./endpoint-examples/EndpointExample";
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

export const EndpointContent = React.memo<EndpointContent.Props>(function EndpointContent({
    endpoint,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
    anchorIdParts,
}) {
    const { apiSection } = useApiDefinitionContext();
    const { setHoveredRequestPropertyPath, setHoveredResponsePropertyPath } = useEndpointContext();
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

    const endpointExample = example ? <EndpointExample endpoint={endpoint} example={example} /> : null;

    return (
        <div
            className={classNames("pb-20 pl-6 md:pl-12 pr-4", {
                "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
            })}
            onClick={() => setSelectedErrorIndex(null)}
        >
            <div
                className="flex min-w-0 flex-1 flex-col justify-between lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
            >
                <div className="flex min-w-0 max-w-2xl flex-1 flex-col">
                    <div className="pb-2 pt-8">
                        {isSubpackage(package_) && (
                            <div className="text-accent-primary mb-4 text-xs font-semibold uppercase tracking-wider">
                                {getSubpackageTitle(package_)}
                            </div>
                        )}
                        <div className="typography-font-heading text-text-primary-light dark:text-text-primary-dark text-3xl font-bold">
                            {getEndpointTitleAsString(endpoint)}
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
                    <ApiPageDescription
                        className="mt-3"
                        description={endpoint.description}
                        isMarkdown={true}
                    />
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
                                        onHoverProperty={onHoverResponseProperty}
                                        selectedErrorIndex={selectedErrorIndex}
                                        anchorIdParts={[...anchorIdParts, "errors"]}
                                    />
                                </EndpointSection>
                            )}
                        </div>
                    </div>
                </div>

                <div
                    className={classNames(
                        "flex-1 sticky self-start min-w-sm max-w-lg ml-auto",
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[calc(100vh-4rem)]",
                        // hide on mobile,
                        "hidden lg:flex",
                        // header offset
                        "top-16"
                    )}
                >
                    {endpointExample}
                </div>

                <div className="mt-10 flex max-h-[150vh] lg:mt-0 lg:hidden">{endpointExample}</div>
            </div>
        </div>
    );
});
