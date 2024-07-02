import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import cn from "clsx";
import { useAtom } from "jotai";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import { FERN_LANGUAGE_ATOM } from "../../atoms/lang";
import { FERN_STREAM_ATOM } from "../../atoms/stream";
import { useDocsContext } from "../../contexts/docs-context/useDocsContext";
import { useLayoutBreakpoint } from "../../contexts/layout-breakpoint/useLayoutBreakpoint";
import { useViewportSize } from "../../hooks/useViewportSize";
import { ResolvedEndpointDefinition, ResolvedError, ResolvedTypeDefinition } from "../../resolver/types";
import { ApiPageDescription } from "../ApiPageDescription";
import { Breadcrumbs } from "../Breadcrumbs";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { CodeExample, generateCodeExamples } from "../examples/code-example";
import { AnimatedTitle } from "./AnimatedTitle";
import { EndpointAvailabilityTag } from "./EndpointAvailabilityTag";
import { EndpointContentLeft, convertNameToAnchorPart } from "./EndpointContentLeft";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { StreamingEnabledToggle } from "./StreamingEnabledToggle";

const EndpointContentCodeSnippets = dynamic(
    () => import("./EndpointContentCodeSnippets").then((mod) => mod.EndpointContentCodeSnippets),
    { ssr: true },
);

export declare namespace EndpointContent {
    export interface Props {
        api: string;
        showErrors: boolean;
        endpoint: ResolvedEndpointDefinition;
        breadcrumbs: readonly string[];
        hideBottomSeparator?: boolean;
        containerRef: React.Ref<HTMLDivElement | null>;
        isInViewport: boolean;
        types: Record<string, ResolvedTypeDefinition>;
    }
}

const GAP_6 = 24;
const TITLED_EXAMPLE_PADDING = 43;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const LINE_HEIGHT = 19.5;
const MOBILE_MAX_LINES = 20;
const CONTENT_PADDING = 16 + TITLED_EXAMPLE_PADDING;

const ERROR_ANCHOR_PREFIX = "response.error.";

function maybeGetErrorStatusCodeOrNameFromAnchor(anchor: string | undefined): number | string | undefined {
    if (anchor != null && anchor.startsWith(ERROR_ANCHOR_PREFIX)) {
        // error anchor format is response.error.{statusCode}.property.a.b.c
        // get {statusCode} from the anchor
        const statusCodeOrErrorName = anchor.split(".")[2];
        if (statusCodeOrErrorName != null) {
            const statusCode = parseInt(statusCodeOrErrorName, 10);
            if (!isNaN(statusCode)) {
                return statusCode;
            } else {
                return statusCodeOrErrorName;
            }
        }
    }
    return undefined;
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({
    api,
    showErrors,
    endpoint: endpointProp,
    breadcrumbs,
    hideBottomSeparator = false,
    containerRef,
    isInViewport: initiallyInViewport,
    types,
}) => {
    const [isStream, setIsStream] = useAtom(FERN_STREAM_ATOM);
    const endpoint = isStream && endpointProp.stream != null ? endpointProp.stream : endpointProp;

    const ref = useRef<HTMLDivElement | null>(null);

    useImperativeHandle(containerRef, () => ref.current);

    const router = useRouter();
    const { layout } = useDocsContext();
    const layoutBreakpoint = useLayoutBreakpoint();
    const viewportSize = useViewportSize();
    const [isInViewport, setIsInViewport] = useState(initiallyInViewport);
    const { ref: viewportRef } = useInView({
        onChange: setIsInViewport,
        rootMargin: "100%",
    });
    const [hoveredRequestPropertyPath, setHoveredRequestPropertyPath] = useState<JsonPropertyPath | undefined>();
    const [hoveredResponsePropertyPath, setHoveredResponsePropertyPath] = useState<JsonPropertyPath | undefined>();
    const onHoverRequestProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredRequestPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredRequestPropertyPath],
    );
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath],
    );

    const [selectedError, setSelectedError] = useState<ResolvedError | undefined>();

    useEffect(() => {
        const statusCodeOrName = maybeGetErrorStatusCodeOrNameFromAnchor(router.asPath.split("#")[1]);
        if (statusCodeOrName != null) {
            const error = endpoint.errors.find((e) =>
                typeof statusCodeOrName === "number"
                    ? e.statusCode === statusCodeOrName
                    : convertNameToAnchorPart(e.name) === statusCodeOrName,
            );
            if (error != null) {
                setSelectedError(error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const examples = useMemo(() => {
        if (selectedError == null) {
            // Look for success example
            return endpoint.examples.filter((e) => e.responseStatusCode >= 200 && e.responseStatusCode < 300);
        }
        return endpoint.examples.filter((e) => e.responseStatusCode === selectedError.statusCode);
    }, [endpoint.examples, selectedError]);

    const [contentType, setContentType] = useState<string | undefined>(endpoint.requestBody?.contentType);
    const clients = useMemo(() => generateCodeExamples(examples), [examples]);
    const [selectedLanguage, setSelectedLanguage] = useAtom(FERN_LANGUAGE_ATOM);
    const [selectedClient, setSelectedClient] = useState<CodeExample>(() => {
        const curlExample = clients[0]?.examples[0];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return clients.find((c) => c.language === selectedLanguage)?.examples[0] ?? curlExample!;
    });
    useEffect(() => {
        setSelectedClient((prev) => clients.find((c) => c.language === selectedLanguage)?.examples[0] ?? prev);
    }, [clients, selectedLanguage]);

    const setSelectedExampleClientAndScrollToTop = useCallback(
        (nextClient: CodeExample) => {
            setSelectedClient(nextClient);
            setSelectedLanguage(nextClient.language);
        },
        [setSelectedLanguage],
    );

    const requestJson =
        selectedClient.exampleCall.requestBody?.type === "json"
            ? selectedClient.exampleCall.requestBody.value
            : undefined;
    const responseJson = selectedClient.exampleCall.responseBody?.value;
    // const responseHast = selectedClient.exampleCall.responseHast;
    const responseCodeSnippet = useMemo(() => JSON.stringify(responseJson, undefined, 2), [responseJson]);

    const selectedExampleClientLineCount = selectedClient.code.split("\n").length;

    const selectorHeight =
        (clients.find((c) => c.language === selectedClient.language)?.examples.length ?? 0) > 1 ? GAP_6 + 24 : 0;

    const headerHeight =
        layout?.headerHeight == null
            ? 64
            : visitDiscriminatedUnion(layout.headerHeight, "type")._visit({
                  px: (px) => px.value,
                  rem: (rem) => rem.value * 16,
                  _other: () => 64,
              });

    const jsonLineLength = responseCodeSnippet?.split("\n").length ?? 0;
    const [requestHeight, responseHeight] = useMemo((): [number, number] => {
        if (layoutBreakpoint.max("lg")) {
            const requestLines = Math.min(MOBILE_MAX_LINES + 1, selectedExampleClientLineCount);
            const responseLines = Math.min(MOBILE_MAX_LINES + 1, jsonLineLength);
            const requestContainerHeight = requestLines * LINE_HEIGHT + CONTENT_PADDING;
            const responseContainerHeight = responseLines * LINE_HEIGHT + CONTENT_PADDING;
            return [requestContainerHeight, responseContainerHeight];
        }
        const maxRequestContainerHeight = selectedExampleClientLineCount * LINE_HEIGHT + CONTENT_PADDING;
        const maxResponseContainerHeight = jsonLineLength * LINE_HEIGHT + CONTENT_PADDING;
        const containerHeight = viewportSize.height - headerHeight - PADDING_TOP - PADDING_BOTTOM - selectorHeight;
        const halfContainerHeight = (containerHeight - GAP_6) / 2;
        if (selectedClient.exampleCall?.responseBody == null) {
            return [Math.min(maxRequestContainerHeight, containerHeight), 0];
        }
        if (maxRequestContainerHeight >= halfContainerHeight && maxResponseContainerHeight >= halfContainerHeight) {
            return [halfContainerHeight, halfContainerHeight];
        } else if (maxRequestContainerHeight + maxResponseContainerHeight <= containerHeight - GAP_6) {
            return [maxRequestContainerHeight, maxResponseContainerHeight];
        } else if (maxRequestContainerHeight < halfContainerHeight) {
            const remainingContainerHeight = containerHeight - maxRequestContainerHeight - GAP_6;
            return [maxRequestContainerHeight, Math.min(remainingContainerHeight, maxResponseContainerHeight)];
        } else if (maxResponseContainerHeight < halfContainerHeight) {
            const remainingContainerHeight = containerHeight - maxResponseContainerHeight - GAP_6;
            return [Math.min(remainingContainerHeight, maxRequestContainerHeight), maxResponseContainerHeight];
        } else {
            return [0, 0];
        }
    }, [
        layoutBreakpoint,
        selectedExampleClientLineCount,
        jsonLineLength,
        viewportSize.height,
        headerHeight,
        selectorHeight,
        selectedClient.exampleCall?.responseBody,
    ]);

    const padding = layoutBreakpoint.max("lg") ? 0 : 26;
    const initialExampleHeight =
        requestHeight + responseHeight + (responseHeight > 0 && requestHeight > 0 ? GAP_6 : 0) + padding;

    const [exampleHeight, setExampleHeight] = useState(initialExampleHeight);

    // Reset the example height (not in view) if the viewport height changes
    useEffect(() => {
        if (!isInViewport) {
            setExampleHeight(initialExampleHeight);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialExampleHeight]);

    return (
        <div
            className={"mx-4 scroll-mt-header-height-padded md:mx-6 lg:mx-8"}
            onClick={() => setSelectedError(undefined)}
            ref={viewportRef}
        >
            <div
                className={cn("scroll-mt-header-height max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px pb-12": !hideBottomSeparator,
                })}
                ref={ref}
                data-route={`/${endpoint.slug}`}
            >
                <div className="space-y-1 pb-2 pt-8">
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                    <div className="flex items-center justify-between">
                        <span>
                            <h1 className="my-0 inline leading-none">
                                <AnimatedTitle>{endpoint.title}</AnimatedTitle>
                            </h1>
                            {endpoint.availability != null && (
                                <span className="inline-block ml-2 align-text-bottom">
                                    <EndpointAvailabilityTag availability={endpoint.availability} minimal={true} />
                                </span>
                            )}
                        </span>

                        {endpointProp.stream != null && (
                            <StreamingEnabledToggle
                                className="ml-2 w-[200px]"
                                value={isStream}
                                setValue={(value) => {
                                    setIsStream(value);
                                    const endpoint =
                                        value && endpointProp.stream != null ? endpointProp.stream : endpointProp;
                                    void router.replace(`/${endpoint.slug}`, undefined, {
                                        shallow: true,
                                    });
                                    setTimeout(() => {
                                        if (ref.current != null) {
                                            ref.current.scrollIntoView({ behavior: "instant" });
                                        }
                                    }, 0);
                                }}
                            />
                        )}
                    </div>
                    <EndpointUrlWithOverflow
                        path={endpoint.path}
                        method={endpoint.method}
                        environment={endpoint.defaultEnvironment?.baseUrl}
                        showEnvironment
                        large
                    />
                </div>
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <div
                        className="flex min-w-0 max-w-content-width flex-1 flex-col pt-8 md:py-8"
                        style={{
                            // TODO: do we still need to set minHeight here?
                            minHeight: layoutBreakpoint.min("md") ? `${exampleHeight}px` : undefined,
                        }}
                    >
                        <ApiPageDescription
                            className="text-base leading-6 mb-12"
                            description={endpoint.description}
                            isMarkdown={true}
                        />

                        <EndpointContentLeft
                            endpoint={endpoint}
                            showErrors={showErrors}
                            onHoverRequestProperty={onHoverRequestProperty}
                            onHoverResponseProperty={onHoverResponseProperty}
                            selectedError={selectedError}
                            setSelectedError={setSelectedError}
                            contentType={contentType}
                            setContentType={setContentType}
                            types={types}
                        />
                    </div>

                    <div
                        className={cn(
                            "max-w-content-width",
                            "md:flex-1 md:sticky md:self-start",
                            "mt-12",
                            // the 4rem is the same as the h-10 as the Header
                            "max-h-[150vh] md:max-h-vh-minus-header",
                            "flex",
                            // header offset
                            "md:py-8 md:mt-0 md:top-header-height",
                        )}
                        style={{
                            minHeight: layoutBreakpoint.min("md") ? `${exampleHeight + 64}px` : `${exampleHeight}px`,
                        }}
                    >
                        {isInViewport && (
                            <EndpointContentCodeSnippets
                                api={api}
                                endpoint={endpoint}
                                example={selectedClient.exampleCall}
                                clients={clients}
                                selectedClient={selectedClient}
                                onClickClient={setSelectedExampleClientAndScrollToTop}
                                requestCodeSnippet={selectedClient.code}
                                requestCurlJson={requestJson}
                                hoveredRequestPropertyPath={hoveredRequestPropertyPath}
                                hoveredResponsePropertyPath={hoveredResponsePropertyPath}
                                showErrors={showErrors}
                                selectedError={selectedError}
                                errors={endpoint.errors}
                                setSelectedError={setSelectedError}
                                measureHeight={setExampleHeight}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
