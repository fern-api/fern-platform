import { ApiDefinition } from "@fern-api/fdr-sdk";
import { EndpointDefinition } from "@fern-api/fdr-sdk/api-definition";

import { useExampleSelection } from "@/components/api-reference/endpoints/useExampleSelection";
import { CodeSnippetExample } from "@/components/api-reference/examples/CodeSnippetExample";

export function EndpointResponseSnippet({
  example,
  endpointDefinition,
  slug,
}: {
  /**
   * The endpoint locator to use for the request snippet.
   */
  endpoint?: string;
  /**
   * The example to use for the request snippet.
   */
  example?: string | undefined;
  /**
   * @internal the rehype-endpoint-snippets plugin will set this
   */
  endpointDefinition?: ApiDefinition.EndpointDefinition;
  /**
   * The slug of the endpoint.
   */
  slug: string;
}) {
  if (endpointDefinition == null) {
    return null;
  }

  return (
    <EndpointResponseSnippetInternal
      endpoint={endpointDefinition}
      example={example}
      slug={slug}
    />
  );
}

function EndpointResponseSnippetInternal({
  endpoint,
  example,
  slug,
}: {
  slug: string;
  endpoint: EndpointDefinition;
  example: string | undefined;
}) {
  const { selectedExample } = useExampleSelection(endpoint, example);

  const responseJson = selectedExample?.exampleCall.responseBody?.value;

  if (responseJson == null) {
    return null;
  }

  const responseJsonString = JSON.stringify(responseJson, null, 2);

  return (
    <div className="mb-5 mt-3">
      <CodeSnippetExample
        title="Response"
        // actions={undefined}
        code={responseJsonString}
        language="json"
        json={responseJson}
        scrollAreaStyle={{ maxHeight: "500px" }}
        slug={slug}
        isResponse
      />
    </div>
  );
}
