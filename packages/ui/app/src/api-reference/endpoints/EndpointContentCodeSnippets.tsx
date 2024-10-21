import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_ARRAY, EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernButton, FernButtonGroup, FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { ReactNode, memo, useMemo, useRef, useState } from "react";
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
import { WebSocketMessages } from "../web-socket/WebSocketMessages";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorExampleSelect } from "./ErrorExampleSelect";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        node: FernNavigation.EndpointNode;
        endpoint: ApiDefinition.EndpointDefinition;
        example: ApiDefinition.ExampleEndpointCall;
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
    example,
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

    const [internalSelectedErrorExample, setSelectedErrorExample] = useState<ApiDefinition.ErrorExample>();

    const handleSelectErrorAndExample = (
        error: ApiDefinition.ErrorResponse | undefined,
        example: ApiDefinition.ErrorExample | undefined,
    ) => {
        setSelectedError(error);
        setSelectedErrorExample(example);
    };

    // if the selected error is not in the list of errors, select the first error
    const selectedErrorExample = useMemo(() => {
        if (selectedError == null || !selectedError.examples || selectedError.examples.length === 0) {
            return undefined;
        } else if (selectedError.examples.findIndex((e) => e === internalSelectedErrorExample) === -1) {
            return selectedError.examples[0];
        }
        return internalSelectedErrorExample;
    }, [internalSelectedErrorExample, selectedError]);

    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);

    const successTitle =
        example.responseBody != null
            ? visitDiscriminatedUnion(example.responseBody)._visit<ReactNode>({
                  json: () => renderResponseTitle(example.responseStatusCode, endpoint.method),
                  filename: () => renderResponseTitle(example.responseStatusCode, endpoint.method),
                  stream: () => "Streamed Response",
                  sse: () => "Server-Sent Events",
                  _other: () => "Response",
              })
            : "Response";

    const errorSelector = showErrors ? (
        <ErrorExampleSelect
            selectedError={selectedError}
            selectedErrorExample={selectedErrorExample}
            errors={errors}
            setSelectedErrorAndExample={handleSelectErrorAndExample}
        >
            {successTitle}
        </ErrorExampleSelect>
    ) : (
        <span className="text-sm t-muted">{successTitle}</span>
    );

    const [baseUrl, environmentId] = usePlaygroundBaseUrl(endpoint);

    return (
        <div className="fern-endpoint-code-snippets" ref={ref}>
            {/* TODO: Replace this with a proper segmented control component */}
            {selectedClientGroup != null && selectedClientGroup.examples.length > 1 && (
                <FernButtonGroup className="min-w-0 shrink">
                    {selectedClientGroup?.examples.map((example) => (
                        <FernButton
                            key={example.key}
                            rounded={true}
                            onClick={() => {
                                onClickClient(example);
                            }}
                            className="min-w-0 shrink truncate"
                            mono
                            size="small"
                            variant={example === selectedClient ? "outlined" : "minimal"}
                            intent={example === selectedClient ? "primary" : "none"}
                        >
                            {example.name}
                        </FernButton>
                    ))}
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
                        {clients.length > 1 ? (
                            <CodeExampleClientDropdown
                                clients={clients}
                                onClickClient={onClickClient}
                                selectedClient={selectedClient}
                            />
                        ) : undefined}
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
            {selectedError != null && (
                <JsonCodeSnippetExample
                    title={errorSelector}
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    hoveredPropertyPath={hoveredResponsePropertyPath}
                    json={selectedErrorExample?.responseBody.value ?? EMPTY_OBJECT}
                    intent={statusCodeToIntent(selectedError.statusCode)}
                />
            )}
            {example.responseBody != null &&
                selectedError == null &&
                visitDiscriminatedUnion(example.responseBody)._visit<ReactNode>({
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

function renderResponseTitle(statusCode: number, method?: APIV1Read.HttpMethod) {
    return (
        <span className="inline-flex items-center gap-2">
            <StatusCodeTag statusCode={statusCode} />
            <span>{ApiDefinition.getMessageForStatus(statusCode, method)}</span>
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
