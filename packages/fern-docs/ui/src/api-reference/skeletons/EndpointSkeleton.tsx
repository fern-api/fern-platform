import { HttpMethodBadge } from "@fern-docs/components/badges";
import cn from "clsx";
import { WithAside } from "../../contexts/api-page";

export const EndpointSkeleton = () => {
  return (
    <WithAside.Provider value={true}>
      <section className="fern-endpoint-content">
        <div
          className={cn(
            "scroll-mt-content max-w-content-width md:max-w-endpoint-width mx-auto",
            "border-default mb-px border-b pb-12"
          )}
        >
          <header className="space-y-1 pb-2 pt-8">
            <a className="fern-breadcrumb-item">API Reference</a>
            <div className="flex items-center justify-between">
              <span>
                <h1 className="fern-page-heading">Loading...</h1>
              </span>
            </div>
            <div className={cn("flex items-center gap-1 pr-2")}>
              <div className={cn("flex items-center gap-1 pr-2")}>
                <HttpMethodBadge method="POST" />
              </div>
            </div>
          </header>
          <div className="md:grid md:grid-cols-2 md:gap-8 lg:gap-12">
            <div className="max-w-content-width flex min-w-0 flex-1 flex-col pt-8 md:py-8" />

            <aside
              className="fern-endpoint-content-right"
              style={{
                height: isInViewport ? undefined : `${exampleHeight}px`,
              }}
            >
              {isInViewport && (
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
                      requestCodeSnippet,
                      baseUrl
                    )}
                    language={selectedLanguage}
                    hoveredPropertyPath={
                      selectedLanguage === "curl"
                        ? hoveredRequestPropertyPath
                        : undefined
                    }
                    json={requestCurlJson}
                    jsonStartLine={
                      selectedLanguage === "curl"
                        ? lineNumberOf(requestCodeSnippet, "-d '{")
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
                        hoveredPropertyPath={hoveredResponsePropertyPath}
                        json={
                          selectedExample?.exampleCall.responseBody?.value ??
                          EMPTY_OBJECT
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
              )}
            </aside>
          </div>
        </div>
      </section>
    </WithAside.Provider>
  );
};
