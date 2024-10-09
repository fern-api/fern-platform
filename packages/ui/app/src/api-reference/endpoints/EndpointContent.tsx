import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EndpointContext } from "@fern-api/fdr-sdk/api-definition";
import type * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import cn from "clsx";
import { useInView } from "framer-motion";
import { atom, useAtom, useAtomValue } from "jotai";
import { selectAtom } from "jotai/utils";
import { isEqual } from "lodash-es";
import dynamic from "next/dynamic";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCallbackOne } from "use-memo-one";
import {
    ANCHOR_ATOM,
    BREAKPOINT_ATOM,
    CONTENT_HEIGHT_ATOM,
    CURRENT_NODE_ID_ATOM,
    FERN_LANGUAGE_ATOM,
    MOBILE_SIDEBAR_ENABLED_ATOM,
    store,
    useAtomEffect,
    useFeatureFlags,
} from "../../atoms";
import { useHref } from "../../hooks/useHref";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { CodeExample, generateCodeExamples } from "../examples/code-example";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContentHeader } from "./EndpointContentHeader";
import { EndpointContentLeft, convertNameToAnchorPart } from "./EndpointContentLeft";

const EndpointContentCodeSnippets = dynamic(
    () => import("./EndpointContentCodeSnippets").then((mod) => mod.EndpointContentCodeSnippets),
    { ssr: true },
);

export declare namespace EndpointContent {
    export interface Props {
        showErrors: boolean;
        context: EndpointContext;
        hideBottomSeparator?: boolean;
        breadcrumb: readonly FernNavigation.BreadcrumbItem[];
        streamToggle?: React.ReactElement;
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

const paddingAtom = atom((get) => (get(MOBILE_SIDEBAR_ENABLED_ATOM) ? 0 : 26));

export const EndpointContent = memo<EndpointContent.Props>((props) => {
    const { showErrors, context, hideBottomSeparator = false, breadcrumb } = props;
    const { node, endpoint } = context;
    const ref = useRef<HTMLDivElement>(null);
    useApiPageCenterElement(ref, node.slug);

    const isInViewport =
        useInView(ref, {
            margin: "100%",
        }) || store.get(CURRENT_NODE_ID_ATOM) === node.id;

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

    const [selectedError, setSelectedError] = useState<ApiDefinition.ErrorResponse>();

    useAtomEffect(
        useCallbackOne(
            (get) => {
                const anchor = get(ANCHOR_ATOM);
                const statusCodeOrName = maybeGetErrorStatusCodeOrNameFromAnchor(anchor);
                if (statusCodeOrName != null) {
                    const error = endpoint.errors?.find((e) =>
                        typeof statusCodeOrName === "number"
                            ? e.statusCode === statusCodeOrName
                            : convertNameToAnchorPart(e.name) === statusCodeOrName,
                    );
                    if (error != null) {
                        setSelectedError(error);
                    }
                }
            },
            [endpoint.errors],
        ),
    );

    const examples = useMemo(() => {
        if (selectedError == null) {
            // Look for success example
            return endpoint.examples?.filter((e) => e.responseStatusCode >= 200 && e.responseStatusCode < 300);
        }
        return endpoint.examples?.filter((e) => e.responseStatusCode === selectedError.statusCode);
    }, [endpoint.examples, selectedError]);

    // TODO: remove after pinecone demo
    const { grpcEndpoints } = useFeatureFlags();
    const [contentType, setContentType] = useState<string | undefined>(endpoint.request?.contentType);
    const clients = useMemo(
        () =>
            generateCodeExamples(
                examples,
                grpcEndpoints?.includes(endpoint.id) &&
                    !(
                        examples != null &&
                        examples.length === 1 &&
                        examples[0]?.snippets?.["curl"] != null &&
                        examples[0]?.snippets["curl"].length > 0
                    ),
            ),
        [examples, grpcEndpoints, endpoint.id],
    );
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

    const jsonLineLength = responseCodeSnippet?.split("\n").length ?? 0;
    const [requestHeight, responseHeight] = useAtomValue(
        useMemo(
            () =>
                selectAtom(
                    atom((get): [number, number] => {
                        const isMobileSidebarEnabled = get(MOBILE_SIDEBAR_ENABLED_ATOM);
                        const contentHeight = get(CONTENT_HEIGHT_ATOM);
                        if (isMobileSidebarEnabled) {
                            const requestLines = Math.min(MOBILE_MAX_LINES + 1, selectedExampleClientLineCount);
                            const responseLines = Math.min(MOBILE_MAX_LINES + 1, jsonLineLength);
                            const requestContainerHeight = requestLines * LINE_HEIGHT + CONTENT_PADDING;
                            const responseContainerHeight = responseLines * LINE_HEIGHT + CONTENT_PADDING;
                            return [requestContainerHeight, responseContainerHeight];
                        }
                        const maxRequestContainerHeight =
                            selectedExampleClientLineCount * LINE_HEIGHT + CONTENT_PADDING;
                        const maxResponseContainerHeight = jsonLineLength * LINE_HEIGHT + CONTENT_PADDING;
                        const containerHeight = contentHeight - PADDING_TOP - PADDING_BOTTOM - selectorHeight;
                        const halfContainerHeight = (containerHeight - GAP_6) / 2;
                        if (selectedClient.exampleCall?.responseBody == null) {
                            return [Math.min(maxRequestContainerHeight, containerHeight), 0];
                        }
                        if (
                            maxRequestContainerHeight >= halfContainerHeight &&
                            maxResponseContainerHeight >= halfContainerHeight
                        ) {
                            return [halfContainerHeight, halfContainerHeight];
                        } else if (maxRequestContainerHeight + maxResponseContainerHeight <= containerHeight - GAP_6) {
                            return [maxRequestContainerHeight, maxResponseContainerHeight];
                        } else if (maxRequestContainerHeight < halfContainerHeight) {
                            const remainingContainerHeight = containerHeight - maxRequestContainerHeight - GAP_6;
                            return [
                                maxRequestContainerHeight,
                                Math.min(remainingContainerHeight, maxResponseContainerHeight),
                            ];
                        } else if (maxResponseContainerHeight < halfContainerHeight) {
                            const remainingContainerHeight = containerHeight - maxResponseContainerHeight - GAP_6;
                            return [
                                Math.min(remainingContainerHeight, maxRequestContainerHeight),
                                maxResponseContainerHeight,
                            ];
                        } else {
                            return [0, 0];
                        }
                    }),
                    (v) => v,
                    isEqual,
                ),
            [jsonLineLength, selectedClient.exampleCall?.responseBody, selectedExampleClientLineCount, selectorHeight],
        ),
    );

    const padding = useAtomValue(paddingAtom);
    const initialExampleHeight =
        requestHeight + responseHeight + (responseHeight > 0 && requestHeight > 0 ? GAP_6 : 0) + padding;

    const [exampleHeightWithoutPadding, setExampleHeight] = useState(initialExampleHeight);
    const exampleHeight = exampleHeightWithoutPadding + 8 * 2 * 4;
    const minHeight = useAtomValue(
        useMemo(
            () =>
                atom((get) => {
                    const breakpoint = get(BREAKPOINT_ATOM);
                    if (breakpoint === "sm" || breakpoint === "mobile") {
                        return 0;
                    } else {
                        return exampleHeight;
                    }
                }),
            [exampleHeight],
        ),
    );

    // Reset the example height (not in view) if the viewport height changes
    useEffect(() => {
        if (!isInViewport) {
            setExampleHeight(initialExampleHeight);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialExampleHeight]);

    return (
        <section
            className={"fern-endpoint-content"}
            onClick={() => setSelectedError(undefined)}
            ref={ref}
            id={useHref(node.slug)}
        >
            <div
                className={cn("scroll-mt-content max-w-content-width md:max-w-endpoint-width mx-auto", {
                    "border-default border-b mb-px pb-12": !hideBottomSeparator,
                })}
            >
                <EndpointContentHeader context={context} breadcrumb={breadcrumb} streamToggle={props.streamToggle} />
                <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
                    <div
                        className="flex min-w-0 max-w-content-width flex-1 flex-col pt-8 md:py-8"
                        style={{
                            // TODO: do we still need to set minHeight here?
                            minHeight: `${minHeight}px`,
                        }}
                    >
                        <EndpointContentLeft
                            context={context}
                            example={selectedClient.exampleCall}
                            showErrors={showErrors}
                            onHoverRequestProperty={onHoverRequestProperty}
                            onHoverResponseProperty={onHoverResponseProperty}
                            selectedError={selectedError}
                            setSelectedError={setSelectedError}
                            contentType={contentType}
                            setContentType={setContentType}
                        />
                    </div>

                    <aside
                        className="fern-endpoint-content-right"
                        style={{
                            height: isInViewport ? undefined : `${exampleHeight}px`,
                        }}
                    >
                        {isInViewport && (
                            <EndpointContentCodeSnippets
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
                                node={node}
                            />
                        )}
                    </aside>
                </div>
            </div>
        </section>
    );
});

EndpointContent.displayName = "EndpointContent";
