import { APIV1Read } from "@fern-api/fdr-sdk";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { useNavigationContext } from "../../navigation-context";
import { getAnchorId } from "../../util/anchor";
import { useViewportContext } from "../../viewport-context/useViewportContext";
import { type CodeExampleClient } from "../examples/code-example";
import { getCurlLines } from "../examples/curl-example/curlUtils";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { flattenJsonToLines } from "../examples/json-example/jsonLineUtils";
import { EndpointContentCodeSnippets } from "./EndpointContentCodeSnippets";
import { EndpointContentLeft } from "./EndpointContentLeft";

export declare namespace EndpointContent {
    export interface Props {
        endpoint: APIV1Read.EndpointDefinition;
        package: APIV1Read.ApiDefinitionPackage;
        anchorIdParts: string[];
        hideBottomSeparator?: boolean;
        setContainerRef: (ref: HTMLElement | null) => void;
        route: string;
    }
}

const GAP_6 = 24;
const TITLED_EXAMPLE_PADDING = 43;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const LINE_HEIGHT = 21.5;
const MOBILE_MAX_LINES = 20;
const CONTENT_PADDING = 40 + TITLED_EXAMPLE_PADDING;

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

export const EndpointContent: React.FC<EndpointContent.Props> = ({
    endpoint,
    package: package_,
    hideBottomSeparator = false,
    setContainerRef,
    anchorIdParts,
    route,
}) => {
    const router = useRouter();
    const { layoutBreakpoint, viewportSize } = useViewportContext();
    const { navigateToPath } = useNavigationContext();
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

    const [storedSelectedExampleClientId, setSelectedExampleClientId] = useAtom(fernClientIdAtom);
    const [selectedErrorIndex, setSelectedErrorIndex] = useState<number | null>(null);

    useEffect(() => {
        const currentAnchor = router.asPath.split("#")[1];
        const errorAnchor = getAnchorId([...anchorIdParts, "errors"]);
        if (currentAnchor != null && currentAnchor.startsWith(`${errorAnchor}-`)) {
            const idx = Number(currentAnchor.substring(errorAnchor.length + 1).split("-")[0]);
            setSelectedErrorIndex(idx);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                ? getCurlLines(apiDefinition, endpoint, example, flattenJsonToLines(example.requestBody))
                : [],
        [apiDefinition, endpoint, example]
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
            className={classNames("pb-20 pl-6 md:pl-12 pr-4 scroll-mt-20", {
                "border-border-default-light dark:border-border-default-dark border-b": !hideBottomSeparator,
            })}
            onClick={() => setSelectedErrorIndex(null)}
            ref={containerRef}
        >
            <div
                className="flex min-w-0 flex-1 scroll-mt-16 flex-col justify-between lg:flex-row lg:space-x-[4vw]"
                ref={setContainerRef}
                data-route={route}
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
                        route={route}
                    />
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
                            endpoint={endpoint}
                            package={package_}
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
