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
    <EndpointSchemaSnippetRenderer
      path={path}
      method={method}
      selector={selector}
    />
  );
}

function EndpointSchemaSnippetRenderer({
  path,
  method,
  selector,
}: SchemaSnippet.InternalProps) {
  console.log("path", path);
  console.log("method", method);
  console.log("selector", selector);

  return <div className="mb-5 mt-3">Snippet!</div>;
}
