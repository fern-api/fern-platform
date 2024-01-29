import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigationContext } from "../../navigation-context";
import { useViewportContext } from "../../viewport-context/useViewportContext";
import { type CodeExampleClient } from "../examples/code-example";
import { getCurlLines } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { flattenJsonToLines } from "../examples/json-example/jsonLineUtils";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { convertNameToAnchorPart, EndpointContentLeft } from "./EndpointContentLeft";

export declare namespace EndpointContent {
    export interface Props {
        apiSection: ResolvedNavigationItemApiSection;
        apiDefinition: ResolvedApiDefinitionPackage;
        endpoint: ResolvedEndpointDefinition;
        subpackageTitle: string | undefined;
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        route: string;
        maxContentWidth: string;
    }
}

const GAP_6 = 24;
const TITLED_EXAMPLE_PADDING = 43;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const LINE_HEIGHT = 20;
const MOBILE_MAX_LINES = 20;
const CONTENT_PADDING = 24 + TITLED_EXAMPLE_PADDING;

const DEFAULT_CLIENT: CodeExampleClient = {
    id: "curl",
    name: "cURL",
};

function getAvailableExampleClients(example: APIV1Read.ExampleEndpointCall): CodeExampleClient[] {
    const clients: CodeExampleClient[] = [DEFAULT_CLIENT];
    const { pythonSdk, typescriptSdk } = example.codeExamples;
    if (pythonSdk != null) {
        clients.push(
            {
                id: "python",
                name: "Python",
                language: "python",
                example: pythonSdk.sync_client,
            },
            {
                id: "python-async",
                name: "Python (Async)",
                language: "python",
                example: pythonSdk.async_client,
            }
        );
    }

    if (typescriptSdk != null && typescriptSdk.client != null) {
        clients.push({
            id: "typescript",
            name: "TypeScript",
            language: "typescript",
            example: typescriptSdk.client,
        });
    }

    return clients;
}

const fernClientIdAtom = atomWithStorage<CodeExampleClient["id"]>("fern-client-id", DEFAULT_CLIENT.id);

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
    apiSection,
    apiDefinition,
    endpoint,
    subpackageTitle,
    hideBottomSeparator = false,
    setContainerRef,
    route,
    maxContentWidth,
}) => {
    const router = useRouter();
    const { layoutBreakpoint, viewportSize } = useViewportContext();
    const { navigateToPath } = useNavigationContext();
    const [isInViewport, setIsInViewport] = useState(false);
    const { ref: containerRef } = useInView({
        onChange: setIsInViewport,
        rootMargin: "100%",
    });
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

    const [storedSelectedExampleClientId, setSelectedExampleClientId] = useAtom(fernClientIdAtom);
    const [selectedError, setSelectedError] = useState<APIV1Read.ErrorDeclarationV2 | undefined>();

    useEffect(() => {
        const statusCodeOrName = maybeGetErrorStatusCodeOrNameFromAnchor(router.asPath.split("#")[1]);
        if (statusCodeOrName != null) {
            const error = endpoint.errors.find((e) =>
                typeof statusCodeOrName === "number"
                    ? e.statusCode === statusCodeOrName
                    : convertNameToAnchorPart(e.name) === statusCodeOrName
            );
            if (error != null) {
                setSelectedError(error);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const example = useMemo(() => {
        if (selectedError == null) {
            // Look for success example
            return endpoint.examples.find((e) => e.responseStatusCode >= 200 && e.responseStatusCode < 300) ?? null;
        }
        return endpoint.examples.find((e) => e.responseStatusCode === selectedError.statusCode) ?? null;
    }, [endpoint.examples, selectedError]);

    const availableExampleClients = useMemo(
        () => (example != null ? getAvailableExampleClients(example) : []),
        [example]
    );

    const selectedExampleClient =
        availableExampleClients.find((client) => client.id === storedSelectedExampleClientId) ?? DEFAULT_CLIENT;

    const setSelectedExampleClientAndScrollToTop = useCallback(
        (nextClient: CodeExampleClient) => {
            setSelectedExampleClientId(nextClient.id);
            navigateToPath(route.substring(1));
        },
        [navigateToPath, route, setSelectedExampleClientId]
    );

    const curlLines = useMemo(
        () =>
            example != null
                ? getCurlLines(apiSection.auth, endpoint, example, flattenJsonToLines(example.requestBody))
                : [],
        [apiSection.auth, endpoint, example]
    );
    const selectedExampleClientLineCount = useMemo(() => {
        return selectedExampleClient.id === "curl"
            ? curlLines.length
            : selectedExampleClient.example.split("\n").length;
    }, [curlLines.length, selectedExampleClient]);

    const jsonLines = useMemo(() => flattenJsonToLines(example?.responseBody), [example?.responseBody]);

    const [requestHeight, responseHeight] = useMemo((): [number, number] => {
        if (layoutBreakpoint !== "lg") {
            const requestLines = Math.min(MOBILE_MAX_LINES + 0.5, selectedExampleClientLineCount);
            const responseLines = Math.min(MOBILE_MAX_LINES + 0.5, jsonLines.length);
            const requestContainerHeight = requestLines * LINE_HEIGHT + CONTENT_PADDING;
            const responseContainerHeight = responseLines * LINE_HEIGHT + CONTENT_PADDING;
            return [requestContainerHeight, responseContainerHeight];
        }
        const maxRequestContainerHeight = selectedExampleClientLineCount * LINE_HEIGHT + CONTENT_PADDING;
        const maxResponseContainerHeight = jsonLines.length * LINE_HEIGHT + CONTENT_PADDING;
        const containerHeight = viewportSize.height - 64 - PADDING_TOP - PADDING_BOTTOM;
        const halfContainerHeight = (containerHeight - GAP_6) / 2;
        if (example?.responseBody == null) {
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
        jsonLines.length,
        viewportSize.height,
        example?.responseBody,
    ]);

    const exampleHeight = requestHeight + responseHeight + GAP_6 + 70;

    return (
        <div
            className={classNames(
                "pl-6 md:pl-12 pr-4 scroll-mt-[74px]",
                "bg-[#FAFAFA] border border-[#E0E0E0] rounded-lg mb-3 mx-3 lg:ml-0",
                {
                    "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
                }
            )}
            onClick={() => setSelectedError(undefined)}
            ref={containerRef}
        >
            <div
                className="flex min-w-0 flex-1 scroll-mt-[74px] flex-col justify-between lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
                data-route={route.toLowerCase()}
            >
                <div
                    className="flex min-w-0 flex-1 flex-col pb-10"
                    style={{
                        minHeight: layoutBreakpoint === "lg" ? `${exampleHeight}px` : undefined,
                        maxWidth: maxContentWidth,
                    }}
                >
                    {apiSection && (
                        <EndpointContentLeft
                            endpoint={endpoint}
                            subpackageTitle={subpackageTitle}
                            apiSection={apiSection}
                            onHoverRequestProperty={onHoverRequestProperty}
                            onHoverResponseProperty={onHoverResponseProperty}
                            selectedError={selectedError}
                            setSelectedError={setSelectedError}
                            route={route}
                        />
                    )}
                </div>

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
                    style={{ height: `${exampleHeight}px` }}
                >
                    {isInViewport && example != null && (
                        <EndpointContentCodeSnippets
                            apiSection={apiSection}
                            apiDefinition={apiDefinition}
                            endpoint={endpoint}
                            example={example}
                            availableExampleClients={availableExampleClients}
                            selectedExampleClient={selectedExampleClient}
                            onClickExampleClient={setSelectedExampleClientAndScrollToTop}
                            requestCurlLines={curlLines}
                            responseJsonLines={jsonLines}
                            hoveredRequestPropertyPath={hoveredRequestPropertyPath}
                            hoveredResponsePropertyPath={hoveredResponsePropertyPath}
                            requestHeight={requestHeight}
                            responseHeight={responseHeight}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};
