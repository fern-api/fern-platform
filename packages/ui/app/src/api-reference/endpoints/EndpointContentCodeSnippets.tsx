import type { APIV1Read } from "@fern-api/fdr-sdk/client/types";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import { FernButton, FernButtonGroup, FernScrollArea } from "@fern-ui/components";
import { useResizeObserver } from "@fern-ui/react-commons";
import { ReactNode, memo, useMemo, useRef, useState } from "react";
import { useNavigationNodes, usePlaygroundEnvironment } from "../../atoms";
import { useSelectedEnvironmentId } from "../../atoms/environment";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { StatusCodeTag, statusCodeToIntent } from "../../components/StatusCodeTag";
import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { mergeEndpointSchemaWithExample } from "../../resolver/SchemaWithExample";
import {
    ResolvedEndpointDefinition,
    ResolvedError,
    ResolvedExampleEndpointCall,
    ResolvedExampleError,
    resolveEnvironment,
    resolveEnvironmentUrlInCodeSnippet,
} from "../../resolver/types";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample, JsonCodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import { TitledExample } from "../examples/TitledExample";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { getMessageForStatus } from "../utils/getMessageForStatus";
import { WebSocketMessages } from "../web-socket/WebSocketMessages";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorExampleSelect } from "./ErrorExampleSelect";

export declare namespace EndpointContentCodeSnippets {
    export interface Props {
        api: string;
        endpoint: ResolvedEndpointDefinition;
        example: ResolvedExampleEndpointCall;
        clients: CodeExampleGroup[];
        selectedClient: CodeExample;
        onClickClient: (example: CodeExample) => void;
        requestCodeSnippet: string;
        requestCurlJson: unknown;
        hoveredRequestPropertyPath: JsonPropertyPath | undefined;
        hoveredResponsePropertyPath: JsonPropertyPath | undefined;
        showErrors: boolean;
        errors: ResolvedError[];
        selectedError: ResolvedError | undefined;
        setSelectedError: (error: ResolvedError | undefined) => void;
        measureHeight: (height: number) => void;
    }
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    endpoint,
    example,
    clients,
    selectedClient,
    onClickClient,
    requestCodeSnippet,
    requestCurlJson,
    hoveredRequestPropertyPath = [],
    hoveredResponsePropertyPath = [],
    showErrors,
    errors,
    selectedError,
    setSelectedError,
    measureHeight,
}) => {
    const nodes = useNavigationNodes();
    const maybeNode = nodes.get(endpoint.nodeId);
    const node = maybeNode != null && FernNavigation.isApiLeaf(maybeNode) ? maybeNode : undefined;

    const ref = useRef<HTMLDivElement>(null);

    useResizeObserver(ref, ([entry]) => {
        if (entry != null) {
            measureHeight(entry.contentRect.height);
        }
    });

    const [internalSelectedErrorExample, setSelectedErrorExample] = useState<ResolvedExampleError | undefined>(
        undefined,
    );

    const handleSelectErrorAndExample = (
        error: ResolvedError | undefined,
        example: ResolvedExampleError | undefined,
    ) => {
        setSelectedError(error);
        setSelectedErrorExample(example);
    };

    // if the selected error is not in the list of errors, select the first error
    const selectedErrorExample = useMemo(() => {
        if (selectedError == null || selectedError.examples.length === 0) {
            return undefined;
        } else if (selectedError.examples.findIndex((e) => e === internalSelectedErrorExample) === -1) {
            return selectedError.examples[0];
        }
        return internalSelectedErrorExample;
    }, [internalSelectedErrorExample, selectedError]);

    const exampleWithSchema = useMemo(() => mergeEndpointSchemaWithExample(endpoint, example), [endpoint, example]);
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);

    const successTitle =
        exampleWithSchema.responseBody != null
            ? visitDiscriminatedUnion(exampleWithSchema.responseBody, "type")._visit<ReactNode>({
                  json: (value) => renderResponseTitle(value.statusCode, endpoint.method),
                  filename: (value) => renderResponseTitle(value.statusCode, endpoint.method),
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

    const selectedEnvironmentId = useSelectedEnvironmentId();
    const playgroundEnvironment = usePlaygroundEnvironment();

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
                        selectedEnvironment={resolveEnvironment(endpoint, selectedEnvironmentId)}
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
                code={resolveEnvironmentUrlInCodeSnippet(
                    endpoint,
                    requestCodeSnippet,
                    playgroundEnvironment,
                    undefined,
                    true,
                )}
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
                    json={selectedErrorExample?.responseBody ?? EMPTY_OBJECT}
                    intent={statusCodeToIntent(selectedError.statusCode)}
                />
            )}
            {exampleWithSchema.responseBody != null &&
                selectedError == null &&
                visitDiscriminatedUnion(exampleWithSchema.responseBody, "type")._visit<ReactNode>({
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
            <span>{getMessageForStatus(statusCode, method)}</span>
        </span>
    );
}
