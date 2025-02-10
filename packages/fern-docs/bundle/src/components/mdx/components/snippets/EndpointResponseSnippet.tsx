import {
  EndpointDefinition,
  HttpMethod,
} from "@fern-api/fdr-sdk/api-definition";

import { useExampleSelection } from "../../../api-reference/endpoints/useExampleSelection";
import { CodeSnippetExample } from "../../../api-reference/examples/CodeSnippetExample";
import { RequestSnippet } from "./types";
import { useFindEndpoint } from "./useFindEndpoint";
import { extractEndpointPathAndMethod } from "./utils";

export const EndpointResponseSnippet: React.FC<
  React.PropsWithChildren<RequestSnippet.Props>
> = ({ endpoint: endpointLocator, example }) => {
  const [method, path] = extractEndpointPathAndMethod(endpointLocator);

  if (method == null || path == null) {
    return null;
  }

  return (
    <EndpointResponseSnippetInternal
      method={method}
      path={path}
      example={example}
    />
  );
};

function EndpointResponseSnippetInternal({
  path,
  method,
  example,
}: {
  path: string;
  method: HttpMethod;
  example: string | undefined;
}) {
  const endpoint = useFindEndpoint(method, path, example);

  if (endpoint == null) {
    return null;
  }

  return (
    <EndpointResponseSnippetRenderer endpoint={endpoint} example={example} />
  );
}

function EndpointResponseSnippetRenderer({
  endpoint,
  example,
}: {
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
      />
    </div>
  );
}
