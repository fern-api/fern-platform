import * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { useAtomValue } from "jotai";
import { EndpointParameter } from "../../../api-reference/endpoints/EndpointParameter";
import { EndpointRequestSection } from "../../../api-reference/endpoints/EndpointRequestSection";
import { EndpointResponseSection } from "../../../api-reference/endpoints/EndpointResponseSection";
import { EndpointSection } from "../../../api-reference/endpoints/EndpointSection";
import { TypeComponentSeparator } from "../../../api-reference/types/TypeComponentSeparator";
import { SLUG_ATOM } from "../../../atoms";
import { SchemaSnippet } from "./types";
import { useFindEndpoint, useFindTypes } from "./useFindEndpoint";
import { extractEndpointPathAndMethod } from "./utils";

export const EndpointSchemaSnippet: React.FC<
  React.PropsWithChildren<SchemaSnippet.Props>
> = ({ endpoint: endpointLocator, selector }) => {
  const [method, path] = extractEndpointPathAndMethod(endpointLocator);

  if (method == null || path == null) {
    return null;
  }

  return (
    <EndpointSchemaSnippetRenderer
      method={method}
      path={path}
      selector={selector}
    />
  );
};

const EndpointSchemaSnippetRenderer: React.FC<
  React.PropsWithChildren<SchemaSnippet.InternalProps>
> = ({ method, path, selector }) => {
  const endpoint = useFindEndpoint(method, path, undefined);
  const types = useFindTypes(method, path);

  if (endpoint == null) {
    return null;
  }

  return (
    <EndpointSchemaSnippetInternal
      endpoint={endpoint}
      types={types ?? {}}
      selector={selector}
    />
  );
};

const REQUEST = ["request"];
const RESPONSE = ["response"];
const REQUEST_PATH = ["request", "path"];
const REQUEST_QUERY = ["request", "query"];
// const REQUEST_HEADER = ["request", "header"];
const REQUEST_BODY = ["request", "body"];
const RESPONSE_BODY = ["response", "body"];
// const RESPONSE_ERROR = ["response", "error"];

function EndpointSchemaSnippetInternal({
  endpoint,
  types,
  selector,
}: {
  endpoint: ApiDefinition.EndpointDefinition;
  types: Record<string, ApiDefinition.TypeDefinition>;
  selector: string | undefined;
}) {
  const currentSlug = useAtomValue(SLUG_ATOM);

  // const types = Object.entries(types).reduce<
  //   Record<string, ApiDefinition.TypeDefinition>
  // >((acc, [key, type]) => ({ ...acc, [`type_:${key}`]: type }), {});

  if (endpoint == null) {
    return null;
  }

  return (
    <div>
      {(selector == null || selector === "request.path") &&
        endpoint.pathParameters &&
        endpoint.pathParameters.length > 0 && (
          <EndpointSection
            title="Path parameters"
            anchorIdParts={REQUEST_PATH}
            slug={currentSlug}
          >
            <div>
              {endpoint.pathParameters.map((parameter) => (
                <div key={parameter.key}>
                  <TypeComponentSeparator />
                  <EndpointParameter
                    name={parameter.key}
                    shape={parameter.valueShape}
                    anchorIdParts={[...REQUEST_PATH, parameter.key]}
                    slug={currentSlug}
                    description={parameter.description}
                    additionalDescriptions={
                      ApiDefinition.unwrapReference(parameter.valueShape, types)
                        .descriptions
                    }
                    availability={parameter.availability}
                    types={types}
                  />
                </div>
              ))}
            </div>
          </EndpointSection>
        )}
      {(selector == null || selector === "request.query") &&
        endpoint.queryParameters &&
        endpoint.queryParameters.length > 0 && (
          <EndpointSection
            title="Query parameters"
            anchorIdParts={REQUEST_QUERY}
            slug={currentSlug}
          >
            <div>
              {endpoint.queryParameters.map((parameter) => (
                <div key={parameter.key}>
                  <TypeComponentSeparator />
                  <EndpointParameter
                    name={parameter.key}
                    shape={parameter.valueShape}
                    anchorIdParts={[...REQUEST_QUERY, parameter.key]}
                    slug={currentSlug}
                    description={parameter.description}
                    additionalDescriptions={
                      ApiDefinition.unwrapReference(parameter.valueShape, types)
                        .descriptions
                    }
                    availability={parameter.availability}
                    types={types}
                  />
                </div>
              ))}
            </div>
          </EndpointSection>
        )}
      {(selector == null || selector === "request.body") &&
        endpoint.requests?.[0] != null && (
          <EndpointSection
            key={endpoint.requests[0].contentType}
            title="Request"
            anchorIdParts={REQUEST}
            slug={currentSlug}
          >
            <EndpointRequestSection
              request={endpoint.requests[0]}
              anchorIdParts={REQUEST_BODY}
              slug={currentSlug}
              types={types}
            />
          </EndpointSection>
        )}
      {(selector == null || selector === "response.body") &&
        endpoint.responses?.[0] != null && (
          <EndpointSection
            title="Response"
            anchorIdParts={RESPONSE}
            slug={currentSlug}
          >
            <EndpointResponseSection
              response={endpoint.responses[0]}
              anchorIdParts={RESPONSE_BODY}
              exampleResponseBody={undefined}
              slug={currentSlug}
              types={types}
            />
          </EndpointSection>
        )}
    </div>
  );
}
