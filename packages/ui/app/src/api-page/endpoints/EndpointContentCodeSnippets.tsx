"use client";
import { visitDiscriminatedUnion } from "@fern-ui/core-utils";
import { ReactNode, memo, useMemo } from "react";
import { PlaygroundButton } from "../../api-playground/PlaygroundButton";
import { FernButton, FernButtonGroup } from "../../components/FernButton";
import { FernErrorTag } from "../../components/FernErrorBoundary";
import { mergeEndpointSchemaWithExample } from "../../resolver/SchemaWithExample";
import { ResolvedEndpointDefinition, ResolvedError, ResolvedExampleEndpointCall } from "../../resolver/types";
import { AudioExample } from "../examples/AudioExample";
import { CodeSnippetExample, JsonCodeSnippetExample } from "../examples/CodeSnippetExample";
import { JsonPropertyPath } from "../examples/JsonPropertyPath";
import type { CodeExample, CodeExampleGroup } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { getSuccessMessageForStatus } from "../utils/getSuccessMessageForStatus";
import { WebSocketMessages } from "../web-socket/WebSocketMessages";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorCodeSnippetExample } from "./ErrorCodeSnippetExample";

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
        selectedError: ResolvedError | undefined;
    }
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<EndpointContentCodeSnippets.Props> = ({
    api,
    endpoint,
    example,
    clients,
    selectedClient,
    onClickClient,
    requestCodeSnippet,
    requestCurlJson,
    hoveredRequestPropertyPath = [],
    hoveredResponsePropertyPath = [],
    selectedError,
}) => {
    const exampleWithSchema = useMemo(() => mergeEndpointSchemaWithExample(endpoint, example), [endpoint, example]);
    const selectedClientGroup = clients.find((client) => client.language === selectedClient.language);
    return (
        <div className="gap-6 grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] grid-rows w-full">
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
                        environment={endpoint.defaultEnvironment?.baseUrl}
                    />
                }
                onClick={(e) => {
                    e.stopPropagation();
                }}
                actions={
                    <>
                        <PlaygroundButton
                            state={{
                                type: "endpoint",
                                api,
                                endpointId: endpoint.slug.join("/"),
                            }}
                            // example={selectedClient.exampleCall}
                        />
                        {clients.length > 1 ? (
                            <CodeExampleClientDropdown
                                clients={clients}
                                onClickClient={onClickClient}
                                selectedClient={selectedClient}
                            />
                        ) : undefined}
                    </>
                }
                code={requestCodeSnippet}
                language={selectedClient.language}
                hoveredPropertyPath={selectedClient.language === "curl" ? hoveredRequestPropertyPath : undefined}
                json={requestCurlJson}
                jsonStartLine={
                    selectedClient.language === "curl" ? lineNumberOf(requestCodeSnippet, "-d '{") : undefined
                }
            />
            {selectedError != null && <ErrorCodeSnippetExample resolvedError={selectedError} />}
            {exampleWithSchema.responseBody != null &&
                selectedError == null &&
                visitDiscriminatedUnion(exampleWithSchema.responseBody, "type")._visit<ReactNode>({
                    json: (value) => (
                        <JsonCodeSnippetExample
                            title={renderResponseTitle(value.statusCode, endpoint.method)}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            hoveredPropertyPath={hoveredResponsePropertyPath}
                            json={value.value}
                        />
                    ),
                    // TODO: support other media types
                    filename: (value) => (
                        <AudioExample title={renderResponseTitle(value.statusCode, endpoint.method)} />
                    ),
                    stream: (value) => (
                        <WebSocketMessages
                            messages={value.value.map((event) => ({
                                type: undefined,
                                origin: undefined,
                                displayName: undefined,
                                data: event,
                            }))}
                        />
                    ),
                    sse: (value) => (
                        <WebSocketMessages
                            messages={value.value.map(({ event, data }) => ({
                                type: event,
                                origin: undefined,
                                displayName: undefined,
                                data,
                            }))}
                        />
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

function renderResponseTitle(statusCode: number, method: string) {
    return (
        <span className="text-sm px-1 t-muted">
            {"Response - "}
            <span className="text-intent-success">
                {`${statusCode} ${getSuccessMessageForStatus(statusCode, method)}`}
            </span>
        </span>
    );
}
