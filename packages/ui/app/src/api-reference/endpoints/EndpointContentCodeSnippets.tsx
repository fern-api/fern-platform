import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY, EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernButton, FernButtonGroup, FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { ReactNode, memo, useMemo, useRef } from "react";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { StatusCodeTag, statusCodeToIntent } from "../../components/StatusCodeTag";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample, JsonCodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TitledExample } from "../examples/TitledExample";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import {
    ExampleIndex,
    ExamplesByClientAndTitleAndStatusCode,
    SelectedExampleKey,
    StatusCode,
} from "../types/EndpointContent";
import { WebSocketMessages } from "../web-socket/WebSocketMessages";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorExampleSelect } from "./ErrorExampleSelect";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        node: FernNavigation.EndpointNode;
        endpoint: ApiDefinition.EndpointDefinition;
        examplesByClientAndTitleAndStatusCode: ExamplesByClientAndTitleAndStatusCode | undefined;
        selectedExampleKey: SelectedExampleKey | undefined;
        setSelectedExampleKey: (exampleKey: SelectedExampleKey | undefined) => void;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
        requestCodeSnippet: string;
        requestCurlJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        showErrors: boolean;
        errors: ApiDefinition.ErrorResponse[] | undefined;
        selectedError: ApiDefinition.ErrorResponse | undefined;
        setSelectedError: (error: ApiDefinition.ErrorResponse | undefined) => void;
        measureHeight: (height: number) => void;
    }
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    node,
    endpoint,
    examplesByClientAndTitleAndStatusCode,
    selectedExampleKey,
    setSelectedExampleKey,
    clients,
    selectedClient,
    onClickClient,
    requestCodeSnippet,
    requestCurlJson,
    hoveredRequestPropertyPath = EMPTY_ARRAY,
    hoveredResponsePropertyPath = EMPTY_ARRAY,
    showErrors,
    errors = EMPTY_ARRAY,
    selectedError,
    setSelectedError,
    measureHeight,
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useResizeObserver(ref, ([entry]) => {
        if (entry != null) {
            measureHeight(entry.contentRect.height);
        }
    });
    const handleSelectErrorAndExample = (error: ApiDefinition.ErrorResponse | undefined) => {
        setSelectedError(error);
    };

    const handleSelectExample = (statusCode: StatusCode, exampleIndex: ExampleIndex) => {
        setSelectedExampleKey([selectedClient.language, selectedExampleKey?.[1], statusCode, exampleIndex]);
    };

    const getExampleId = useMemo(
        () => (example: CodeExample | undefined, errorName: string | undefined, exampleIndex: number | undefined) =>
            example?.exampleCall.responseBody != null
                ? visitDiscriminatedUnion(example.exampleCall.responseBody)._visit<ReactNode>({
                      json: () =>
                          example.globalError || errorName
                              ? renderErrorTitle(errorName, example.exampleCall.responseStatusCode, exampleIndex)
                              : renderExampleTitle(
                                    example.exampleCall.responseStatusCode,
                                    endpoint.method,
                                    exampleIndex,
                                ),
                      filename: () =>
                          example.globalError || errorName
                              ? renderErrorTitle(errorName, example.exampleCall.responseStatusCode, exampleIndex)
                              : renderExampleTitle(
                                    example.exampleCall.responseStatusCode,
                                    endpoint.method,
                                    exampleIndex,
                                ),
                      stream: () => "Streamed Response",
                      sse: () => "Server-Sent Events",
                      _other: () => "Response",
                  })
                : "Response",
        [endpoint],
    );

    const selectedExample = useMemo(() => {
        if (selectedExampleKey == null) {
            return undefined;
        }
        const [language, title, statusCode, exampleIndex] = selectedExampleKey;
        if (language == null || title == null || statusCode == null || exampleIndex == null) {
            return undefined;
        }
        return examplesByClientAndTitleAndStatusCode?.[language]?.[title]?.[statusCode]?.[exampleIndex];
    }, [selectedExampleKey, examplesByClientAndTitleAndStatusCode]);

    const errorSelector = showErrors ? (
        <ErrorExampleSelect
            errors={errors}
            selectedError={selectedError}
            setSelectedErrorAndExample={handleSelectErrorAndExample}
            selectedExampleKey={selectedExampleKey}
            setSelectedExampleKey={handleSelectExample}
            examplesByStatusCode={
                examplesByClientAndTitleAndStatusCode?.[selectedClient.language]?.[selectedExampleKey?.[1] ?? ""]
            }
            getExampleId={getExampleId}
        />
    ) : (
        <span className="text-sm t-muted">
            {getExampleId(selectedExample, selectedError?.examples?.[0]?.name, undefined)}
        </span>
    );

    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);

    const filteredClientExamples = useMemo(() => {
        const examples = examplesByClientAndTitleAndStatusCode?.[selectedClient.language];
        if (examples == null) {
            return [];
        }
        return Object.values(examples).flatMap((examplesByStatusCode) => {
            const statusCode = selectedExample?.exampleCall.responseStatusCode;
            if (statusCode == null || statusCode >= 400) {
                return [];
            }
            return examplesByStatusCode[statusCode]?.filter((e) => !e.globalError) ?? [];
        });
    }, [examplesByClientAndTitleAndStatusCode, selectedClient.language, selectedExample]);

    return (
        <div className="fern-endpoint-code-snippets" ref={ref}>
            {/* TODO: Replace this with a proper segmented control component */}
            {filteredClientExamples != null && filteredClientExamples.length > 1 && (
                <FernButtonGroup className="min-w-0 shrink">
                    {filteredClientExamples.map(
                        (example) =>
                            example && (
                                <FernButton
                                    key={example.key}
                                    rounded={true}
                                    onClick={() => {
                                        onClickClient(example);
                                        const foundExampleIndex = examplesByClientAndTitleAndStatusCode?.[
                                            example.language
                                        ]?.[example.key]?.[example.exampleCall.responseStatusCode ?? 0]?.findIndex(
                                            (e) => e?.key === example.key,
                                        );
                                        setSelectedExampleKey([
                                            example.language,
                                            example.key,
                                            example.exampleCall.responseStatusCode,
                                            foundExampleIndex && foundExampleIndex >= 0 ? foundExampleIndex : 0,
                                        ]);
                                    }}
                                    className="min-w-0 shrink truncate"
                                    mono
                                    size="small"
                                    variant={example === selectedClient ? "outlined" : "minimal"}
                                    intent={example === selectedClient ? "primary" : "none"}
                                >
                                    {example.name}
                                </FernButton>
                            ),
                    )}
                </FernButtonGroup>
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
                                // example={selectedClient.exampleCall}
                            />
                        )}
                        {
                            // filteredClientsByStatusCode != null && filteredClientsByStatusCode.length > 1 ? (
                            clients.length > 1 ? (
                                <CodeExampleClientDropdown
                                    clients={clients}
                                    onClickClient={onClickClient}
                                    selectedClient={selectedClient}
                                />
                            ) : undefined
                        }
                    </>
                }
                code={resolveEnvironmentUrlInCodeSnippet(endpoint, requestCodeSnippet, baseUrl)}
                language={selectedClient.language}
                hoveredPropertyPath={selectedClient.language === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={
                    selectedClient.language === "curl" ? lineNumberOf(requestCodeSnippet, "-d '{") : undefined
                }
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

function applyExampleIndex(name: string | undefined, exampleIndex?: number) {
    return exampleIndex ? `${name} Example ${exampleIndex}` : name;
}

function renderErrorTitle(errorName: string | undefined, statusCode: number, exampleIndex?: number) {
    return renderResponseTitle(
        applyExampleIndex(errorName, exampleIndex) ?? ApiDefinition.getMessageForStatus(statusCode),
        statusCode,
    );
}

function renderExampleTitle(statusCode: number, method?: APIV1Read.HttpMethod, exampleIndex?: number) {
    return renderResponseTitle(
        applyExampleIndex(ApiDefinition.getMessageForStatus(statusCode, method), exampleIndex) ?? "Response",
        statusCode,
    );
}

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
