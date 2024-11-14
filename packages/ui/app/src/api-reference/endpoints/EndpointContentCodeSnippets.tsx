import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY, EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { sortBy } from "es-toolkit";
import { RESET } from "jotai/utils";
import { ReactNode, SetStateAction, memo, useCallback, useMemo, useRef } from "react";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { StatusCodeTag, statusCodeToIntent } from "../../components/StatusCodeTag";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample, JsonCodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TitledExample } from "../examples/TitledExample";
import type { CodeExample } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import {
    ExamplesByKeyAndStatusCode,
    ExamplesByStatusCode,
    SelectedExampleKey,
    StatusCode,
} from "../types/EndpointContent";
import { WebSocketMessages } from "../web-socket/WebSocketMessages";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointExampleSegmentedControl } from "./EndpointExampleSegmentedControl";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorExampleSelect } from "./ErrorExampleSelect";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        node: FernNavigation.EndpointNode;
        endpoint: ApiDefinition.EndpointDefinition;
        languages: string[];
        examplesByKeyAndStatusCode: ExamplesByKeyAndStatusCode;
        examplesByStatusCode: ExamplesByStatusCode;
        selectedExample: CodeExample | undefined;
        selectedLanguage: string;
        setSelectedExampleKey: (exampleKey: SetStateAction<SelectedExampleKey> | typeof RESET) => void;
        requestCodeSnippet: string;
        requestCurlJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        showErrors: boolean;
        errors: ApiDefinition.ErrorResponse[] | undefined;
        selectedError: ApiDefinition.ErrorResponse | undefined;
        measureHeight: (height: number) => void;
    }
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    node,
    endpoint,
    examplesByKeyAndStatusCode,
    examplesByStatusCode,
    selectedExample,
    selectedLanguage,
    setSelectedExampleKey,
    languages,
    requestCodeSnippet,
    requestCurlJson,
    hoveredRequestPropertyPath = EMPTY_ARRAY,
    hoveredResponsePropertyPath = EMPTY_ARRAY,
    showErrors,
    measureHeight,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useResizeObserver(ref, ([entry]) => {
        if (entry != null) {
            measureHeight(entry.contentRect.height);
        }
    });

    const handleSelectExample = useCallback(
        (statusCode: StatusCode, responseIndex: number) => {
            setSelectedExampleKey((prev) => ({ ...prev, statusCode, responseIndex }));
        },
        [setSelectedExampleKey],
    );

    const getExampleId = useCallback(
        (example: CodeExample | undefined) => {
            switch (example?.exampleCall.responseBody?.type) {
                case "json":
                case "filename": {
                    const title =
                        example.exampleCall.name ??
                        ApiDefinition.getMessageForStatus(example.exampleCall.responseStatusCode, endpoint.method) ??
                        "Response";
                    return renderResponseTitle(title, example.exampleCall.responseStatusCode);
                }
                case "stream":
                    return "Streamed Response";
                case "sse":
                    return "Server-Sent Events";
                default:
                    return "Response";
            }
        },
        [endpoint.method],
    );

    const errorSelector =
        showErrors && Object.keys(examplesByStatusCode).length > 1 ? (
            <ErrorExampleSelect
                examplesByStatusCode={examplesByStatusCode}
                selectedExample={selectedExample}
                setSelectedExampleKey={handleSelectExample}
                getExampleId={getExampleId}
            />
        ) : (
            <span className="text-sm t-muted line-clamp-1">{getExampleId(selectedExample)}</span>
        );

    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);

    const segmentedControlExamples = useMemo(() => {
        return Object.entries(examplesByKeyAndStatusCode)
            .map(([exampleKey, examples]) => {
                const examplesSorted = sortBy(Object.values(examples).flat(), [
                    (example) => example.exampleCall.responseStatusCode,
                ]);
                return { exampleKey, examples: examplesSorted };
            })
            .filter(
                ({ examples }) =>
                    examples.length > 0 &&
                    (examples.some((example) => example.exampleCall.responseStatusCode < 400) ||
                        examples[0]?.name != null),
            );
    }, [examplesByKeyAndStatusCode]);

    // note: .fern-endpoint-code-snippets is used to detect clicks outside of the code snippets
    // this is used to clear the selected error when the user clicks outside of the error
    return (
        <div className="fern-endpoint-code-snippets" ref={ref}>
            {segmentedControlExamples.length > 1 && (
                <EndpointExampleSegmentedControl
                    segmentedControlExamples={segmentedControlExamples}
                    selectedExample={selectedExample}
                    onSelectExample={(exampleKey) => {
                        setSelectedExampleKey((prev) => {
                            if (prev.exampleKey === exampleKey) {
                                return prev;
                            }
                            return { ...prev, exampleKey };
                        });
                    }}
                />
            )}
            <CodeSnippetExample
                title={
                    <EndpointUrlWithOverflow
                        path={endpoint.path}
                        method={endpoint.method}
                        environmentId={environmentId}
                        baseUrl={baseUrl}
                    />
                }
                onClick={(e) => {
                    e.stopPropagation();
                }}
                actions={
                    <>
                        {node != null && (
                            <PlaygroundButton
                                state={node}
                                // example={selectedExample?.exampleCall}
                            />
                        )}
                        {languages.length > 1 && (
                            <CodeExampleClientDropdown
                                languages={languages}
                                value={selectedLanguage}
                                onValueChange={(language) => {
                                    setSelectedExampleKey((prev) => ({ ...prev, language }));
                                }}
                            />
                        )}
                    </>
                }
                code={resolveEnvironmentUrlInCodeSnippet(endpoint, requestCodeSnippet, baseUrl)}
                language={selectedLanguage}
                hoveredPropertyPath={selectedLanguage === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={selectedLanguage === "curl" ? lineNumberOf(requestCodeSnippet, "-d '{") : undefined}
            />
            {selectedExample != null && selectedExample.exampleCall.responseStatusCode >= 400 && (
                <JsonCodeSnippetExample
                    title={errorSelector}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    hoveredPropertyPath={hoveredResponsePropertyPath}
                    json={selectedExample?.exampleCall.responseBody?.value ?? EMPTY_OBJECT}
                    intent={statusCodeToIntent(selectedExample.exampleCall.responseStatusCode)}
                />
            )}
            {selectedExample?.exampleCall.responseBody != null &&
                selectedExample.exampleCall.responseStatusCode >= 200 &&
                selectedExample.exampleCall.responseStatusCode < 300 &&
                visitDiscriminatedUnion(selectedExample.exampleCall.responseBody)._visit<ReactNode>({
                    json: (value) => (
                        <JsonCodeSnippetExample
                            title={errorSelector}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            hoveredPropertyPath={hoveredResponsePropertyPath}
                            json={value.value}
                        />
                    ),
                    // TODO: support other media types
                    filename: () => <AudioExample title={errorSelector} />,
                    stream: (value) => (
                        <TitledExample title={errorSelector}>
                            <FernScrollArea className="rounded-b-[inherit]">
                                <WebSocketMessages
                                    messages={value.value.map((event) => ({
                                        type: undefined,
                                        origin: undefined,
                                        displayName: undefined,
                                        data: event,
                                    }))}
                                />
                            </FernScrollArea>
                        </TitledExample>
                    ),
                    sse: (value) => (
                        <TitledExample title={errorSelector}>
                            <FernScrollArea className="rounded-b-[inherit]">
                                <WebSocketMessages
                                    messages={value.value.map(({ event, data }) => ({
                                        type: event,
                                        origin: undefined,
                                        displayName: undefined,
                                        data,
                                    }))}
                                />
                            </FernScrollArea>
                        </TitledExample>
                    ),
                    _other: () => (
                        <FernErrorTag
                            component="EndpointContentCodeSnippets"
                            error="example.responseBody is an unknown type"
                        />
                    ),
                })}
        </div>
    );
};

export const EndpointContentCodeSnippets = memo(UnmemoizedEndpointContentCodeSnippets);

// function applyExampleIndex(name: string | undefined, exampleIndex?: number) {
//     return exampleIndex ? `${name} Example ${exampleIndex}` : name;
// }

// function renderErrorTitle(errorName: string | undefined, statusCode: number, exampleIndex?: number) {
//     return renderResponseTitle(
//         applyExampleIndex(errorName, exampleIndex) ?? ApiDefinition.getMessageForStatus(statusCode),
//         statusCode,
//     );
// }

// function renderExampleTitle(statusCode: number, method?: APIV1Read.HttpMethod, exampleIndex?: number) {
//     return renderResponseTitle(
//         applyExampleIndex(ApiDefinition.getMessageForStatus(statusCode, method), exampleIndex) ?? "Response",
//         statusCode,
//     );
// }

function renderResponseTitle(title: string, statusCode: number) {
    return (
        <span className="inline-flex items-center gap-2">
            <StatusCodeTag statusCode={statusCode} />
            <span className={`text-intent-${statusCodeToIntent(Number(statusCode))}`}>{title}</span>
        </span>
    );
}

const resolveEnvironmentUrlInCodeSnippet = (
    endpoint: ApiDefinition.EndpointDefinition,
    requestCodeSnippet: string,
    baseUrl: string | undefined,
): string => {
    const urlToReplace = endpoint.environments?.find((env) => requestCodeSnippet.includes(env.baseUrl))?.baseUrl;
    return urlToReplace && baseUrl ? requestCodeSnippet.replace(urlToReplace, baseUrl) : requestCodeSnippet;
};
