import { useExampleSelection } from "../../../api-reference/endpoints/useExampleSelection";
import { CodeSnippetExample } from "../../../api-reference/examples/CodeSnippetExample";
import { SchemaSnippet } from "./types";
import { useFindEndpoint } from "./useFindEndpoint";
import { extractEndpointPathAndMethod } from "./utils";

export const EndpointSchemaSnippet: React.FC<
  React.PropsWithChildren<SchemaSnippet.Props>
> = ({ endpoint: endpointLocator, selector }) => {
  const [method, path] = extractEndpointPathAndMethod(endpointLocator);

  if (method == null || path == null) {
    return null;
  }

  return (
    <EndpointSchemaSnippetInternal
      method={method}
      path={path}
      selector={selector}
    />
  );
};

function EndpointSchemaSnippetInternal({
  path,
  method,
  selector,
}: SchemaSnippet.InternalProps) {
  const endpoint = useFindEndpoint(method, path, selector);

  if (endpoint == null) {
    return null;
  }

  return (
    <EndpointSchemaSnippetRenderer endpoint={endpoint} selector={selector} />
  );
}

function EndpointSchemaSnippetRenderer({
  endpoint,
  selector,
}: SchemaSnippet.InternalProps) {
  const { selectedExample } = useExampleSelection(endpoint, selector);

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
