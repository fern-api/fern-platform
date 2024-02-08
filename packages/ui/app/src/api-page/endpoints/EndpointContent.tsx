import { APIV1Read } from "@fern-api/fdr-sdk";
import {
    ResolvedApiDefinitionPackage,
    ResolvedEndpointDefinition,
    ResolvedNavigationItemApiSection,
} from "@fern-ui/app-utils";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import classNames from "classnames";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { useNavigationContext } from "../../navigation-context";
import { useViewportContext } from "../../viewport-context/useViewportContext";
import { CodeExample, generateCodeExamples } from "../examples/code-example";
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
    }
}

const GAP_6 = 24;
const TITLED_EXAMPLE_PADDING = 43;
const PADDING_TOP = 32;
const PADDING_BOTTOM = 40;
const LINE_HEIGHT = 21.5;
const MOBILE_MAX_LINES = 20;
const CONTENT_PADDING = 40 + TITLED_EXAMPLE_PADDING;

const fernLanguageAtom = atomWithStorage<string>("fern-language-id", "curl");

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
}) => {
    const router = useRouter();
    const { config } = useDocsContext();
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
        [setHoveredRequestPropertyPath],
    );
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath],
    );

    const [selectedError, setSelectedError] = useState<APIV1Read.ErrorDeclarationV2 | undefined>();

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
            return endpoint.examples.filter((e) => e.responseStatusCode >= 200 && e.responseStatusCode < 300) ?? null;
        }
        return endpoint.examples.filter((e) => e.responseStatusCode === selectedError.statusCode) ?? null;
    }, [endpoint.examples, selectedError]);

    const clients = useMemo(() => generateCodeExamples(examples), [examples]);
    const [selectedLanguage, setSelectedLanguage] = useAtom(fernLanguageAtom);
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
            navigateToPath(route.substring(1));
            setSelectedLanguage(nextClient.language);
        },
        [navigateToPath, route, setSelectedLanguage],
    );

    const curlLines = useMemo(
        () =>
            getCurlLines(
                apiSection.auth,
                endpoint,
                selectedClient.exampleCall,
                flattenJsonToLines(selectedClient.exampleCall.requestBody),
            ),
        [apiSection.auth, endpoint, selectedClient.exampleCall],
    );

    const selectedExampleClientLineCount = useMemo(() => {
        return selectedClient.language === "curl" && selectedClient.code === ""
            ? curlLines.length
            : selectedClient.code.split("\n").length;
    }, [curlLines.length, selectedClient]);

    const jsonLines = useMemo(
        () => flattenJsonToLines(selectedClient.exampleCall.responseBody),
        [selectedClient.exampleCall.responseBody],
    );

    const jsonLineLength = jsonLines
        .map((jsonLine) => (jsonLine.type === "string" ? jsonLine.value.split("\n").length : 1))
        .reduce((a, b) => a + b, 0);

    const selectorHeight =
        (clients.find((c) => c.language === selectedClient.language)?.examples.length ?? 0) > 1 ? GAP_6 + 24 : 0;

    const headerHeight =
        config.layout?.headerHeight == null
            ? 64
            : visitDiscriminatedUnion(config.layout.headerHeight, "type")._visit({
                  px: (px) => px.value,
                  rem: (rem) => rem.value * 16,
                  _other: () => 64,
              });

    const [requestHeight, responseHeight] = useMemo((): [number, number] => {
        if (!["lg", "xl", "2xl"].includes(layoutBreakpoint)) {
            const requestLines = Math.min(MOBILE_MAX_LINES + 0.5, selectedExampleClientLineCount);
            const responseLines = Math.min(MOBILE_MAX_LINES + 0.5, jsonLineLength);
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

    const exampleHeight = requestHeight + responseHeight + GAP_6 + 70;

    return (
        <div
            className={"scroll-mt-header-height-padded mx-4 md:mx-6 lg:mx-8"}
            onClick={() => setSelectedError(undefined)}
            ref={containerRef}
        >
            <div
                className={classNames(
                    "scroll-mt-header-height max-w-content-width lg:max-w-endpoint-width mx-auto lg:grid lg:grid-cols-2 lg:gap-12",
                    {
                        "border-default border-b mb-px pb-20": !hideBottomSeparator,
                    },
                )}
                ref={setContainerRef}
                data-route={route.toLowerCase()}
            >
                <div
                    className="max-w-content-width flex min-w-0 flex-1 flex-col"
                    style={{
                        minHeight: layoutBreakpoint === "lg" ? `${exampleHeight}px` : undefined,
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
                        "max-w-content-width",
                        "lg:flex-1 lg:sticky lg:self-start",
                        "pb-10 pt-8",
                        // the 4rem is the same as the h-10 as the Header
                        "max-h-[150vh] lg:max-h-vh-minus-header",
                        "flex",
                        // header offset
                        "mt-10 lg:mt-0 lg:top-header-height",
                    )}
                    style={{ height: `${exampleHeight}px` }}
                >
                    {isInViewport && (
                        <EndpointContentCodeSnippets
                            apiSection={apiSection}
                            apiDefinition={apiDefinition}
                            endpoint={endpoint}
                            example={selectedClient.exampleCall}
                            clients={clients}
                            selectedClient={selectedClient}
                            onClickClient={setSelectedExampleClientAndScrollToTop}
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
