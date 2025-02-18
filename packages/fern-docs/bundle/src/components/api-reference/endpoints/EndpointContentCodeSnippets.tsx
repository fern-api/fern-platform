"use client";

import { ReactNode, memo, useCallback, useMemo } from "react";

import { sortBy } from "es-toolkit/array";

import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { EMPTY_OBJECT, visitDiscriminatedUnion } from "@fern-api/ui-core-utils";
import {
  FernScrollArea,
  StatusCodeBadge,
  cn,
  statusCodeToIntent,
} from "@fern-docs/components";

import { WebSocketMessages } from "@/components/api-reference/websockets/WebSocketMessages";

import { PlaygroundButton } from "../../playground/PlaygroundButton";
import { usePlaygroundBaseUrl } from "../../playground/utils/select-environment";
import { AudioExample } from "../examples/AudioExample";
import {
  CodeSnippetExample,
  JsonCodeSnippetExample,
} from "../examples/CodeSnippetExample";
import { TitledExample } from "../examples/TitledExample";
import type { CodeExample } from "../examples/code-example";
import { lineNumberOf } from "../examples/utils";
import { StatusCode } from "../type-definitions/EndpointContent";
import { CodeExampleClientDropdown } from "./CodeExampleClientDropdown";
import { useEndpointContext } from "./EndpointContext";
import { EndpointExampleSegmentedControl } from "./EndpointExampleSegmentedControl";
import { EndpointUrlWithOverflow } from "./EndpointUrlWithOverflow";
import { ErrorExampleSelect } from "./ErrorExampleSelect";

export declare namespace EndpointContentCodeSnippets {
  export interface Props {
    node: FernNavigation.EndpointNode;
    endpoint: ApiDefinition.EndpointDefinition;
    showErrors: boolean;
    className?: string;
  }
}

const UnmemoizedEndpointContentCodeSnippets: React.FC<
  EndpointContentCodeSnippets.Props
> = ({ node, endpoint, showErrors, className }) => {
  const {
    selectedExample,
    examplesByStatusCode,
    examplesByKeyAndStatusCode,
    selectedExampleKey,
    availableLanguages: languages,
    setSelectedExampleKey,
  } = useEndpointContext();

  const handleSelectExample = useCallback(
    (statusCode: StatusCode, responseIndex: number) => {
      setSelectedExampleKey((prev) => ({
        ...prev,
        statusCode,
        responseIndex,
      }));
    },
    [setSelectedExampleKey]
  );

  const getExampleId = useCallback(
    (example: CodeExample | undefined) => {
      switch (example?.exampleCall.responseBody?.type) {
        case "json":
        case "filename": {
          const title =
            example.exampleCall.name ??
            ApiDefinition.getMessageForStatus(
              example.exampleCall.responseStatusCode,
              endpoint.method
            ) ??
            "Response";
          return renderResponseTitle(
            title,
            example.exampleCall.responseStatusCode
          );
        }
        case "stream":
          return "Streamed Response";
        case "sse":
          return "Server-Sent Events";
        default:
          return "Response";
      }
    },
    [endpoint.method]
  );

  const errorSelector =
    showErrors &&
    Object.values(examplesByStatusCode).some(
      (examples) => examples.length > 1
    ) ? (
      <ErrorExampleSelect
        examplesByStatusCode={examplesByStatusCode}
        selectedExample={selectedExample}
        setSelectedExampleKey={handleSelectExample}
        getExampleId={getExampleId}
      />
    ) : (
      <span className="text-muted line-clamp-1 text-sm">
        {getExampleId(selectedExample)}
      </span>
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
          (examples.some(
            (example) => example.exampleCall.responseStatusCode < 400
          ) ||
            examples[0]?.name != null)
      );
  }, [examplesByKeyAndStatusCode]);

  return (
    <div
      className={cn(
        // note: .fern-endpoint-code-snippets class is used to detect clicks outside of the code snippets
        // this is used to clear the selected error when the user clicks outside of the error
        "fern-endpoint-code-snippets w-full",
        // this is used to ensure that two long code snippets will take up the same height,
        // but if one is shorter the other snippet will take up the remaining space
        "grid grid-rows-[repeat(auto-fit,minmax(0,min-content))] gap-6",
        className
      )}
    >
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
                value={selectedExampleKey.language}
                onValueChange={(language) => {
                  setSelectedExampleKey((prev) => ({
                    ...prev,
                    language,
                  }));
                }}
              />
            )}
          </>
        }
        code={resolveEnvironmentUrlInCodeSnippet(
          endpoint,
          selectedExample?.code ?? "",
          baseUrl
        )}
        language={selectedExampleKey.language}
        json={selectedExample?.code ?? ""}
        jsonStartLine={
          selectedExampleKey.language === "curl"
            ? lineNumberOf(selectedExample?.code ?? "", "-d '{")
            : undefined
        }
      />
      {selectedExample != null &&
        selectedExample.exampleCall.responseStatusCode >= 400 && (
          <JsonCodeSnippetExample
            title={errorSelector}
            onClick={(e) => {
              e.stopPropagation();
            }}
            json={
              selectedExample?.exampleCall.responseBody?.value ?? EMPTY_OBJECT
            }
            intent={statusCodeToIntent(
              String(selectedExample.exampleCall.responseStatusCode)
            )}
          />
        )}
      {selectedExample?.exampleCall.responseBody != null &&
        selectedExample.exampleCall.responseStatusCode >= 200 &&
        selectedExample.exampleCall.responseStatusCode < 300 &&
        visitDiscriminatedUnion(
          selectedExample.exampleCall.responseBody
        )._visit<ReactNode>({
          json: (value) => (
            <JsonCodeSnippetExample
              title={errorSelector}
              onClick={(e) => {
                e.stopPropagation();
              }}
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
          _other: () => {
            throw new Error("example.responseBody is an unknown type");
          },
        })}
    </div>
  );
};

export const EndpointContentCodeSnippets = memo(
  UnmemoizedEndpointContentCodeSnippets
);

function renderResponseTitle(title: string, statusCode: number | string) {
  return (
    <span className="inline-flex items-center gap-2">
      <StatusCodeBadge statusCode={statusCode} />
      <span className={`text-intent-${statusCodeToIntent(String(statusCode))}`}>
        {title}
      </span>
    </span>
  );
}

const resolveEnvironmentUrlInCodeSnippet = (
  endpoint: ApiDefinition.EndpointDefinition,
  requestCodeSnippet: string,
  baseUrl: string | undefined
): string => {
  const urlToReplace = endpoint.environments?.find((env) =>
    requestCodeSnippet.includes(env.baseUrl)
  )?.baseUrl;
  return urlToReplace && baseUrl
    ? requestCodeSnippet.replace(urlToReplace, baseUrl)
    : requestCodeSnippet;
};
