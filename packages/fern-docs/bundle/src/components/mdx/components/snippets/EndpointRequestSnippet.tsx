import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { useAtomValue } from "jotai";
import { ReactElement } from "react";
import { CodeExampleClientDropdown } from "../../../api-reference/endpoints/CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "../../../api-reference/endpoints/EndpointUrlWithOverflow";
import { useExampleSelection } from "../../../api-reference/endpoints/useExampleSelection";
import { CodeSnippetExample } from "../../../api-reference/examples/CodeSnippetExample";
import { ENDPOINT_ID_TO_SLUG_ATOM } from "../../../atoms";
import { ApiReferenceButton } from "../../../components/ApiReferenceButton";
import { usePlaygroundBaseUrl } from "../../../playground/utils/select-environment";
import { RequestSnippet } from "./types";
import { useFindEndpoint } from "./useFindEndpoint";
import { extractEndpointPathAndMethod } from "./utils";

export const EndpointRequestSnippet: React.FC<
  React.PropsWithChildren<RequestSnippet.Props>
> = ({ endpoint: endpointLocator, example }) => {
  const [method, path] = extractEndpointPathAndMethod(endpointLocator);

  if (method == null || path == null) {
    return null;
  }

  return (
    <EndpointRequestSnippetRenderer
      method={method}
      path={path}
      example={example}
    />
  );
};

const EndpointRequestSnippetRenderer: React.FC<
  React.PropsWithChildren<RequestSnippet.InternalProps>
> = ({ method, path, example }) => {
  const endpoint = useFindEndpoint(method, path, example);

  if (endpoint == null) {
    return null;
  }

  return (
    <EndpointRequestSnippetInternal endpoint={endpoint} example={example} />
  );
};

export function EndpointRequestSnippetInternal({
  endpoint,
  example,
}: {
  endpoint: ApiDefinition.EndpointDefinition;
  example: string | undefined;
}): ReactElement<any> | null {
  const slug = useAtomValue(ENDPOINT_ID_TO_SLUG_ATOM)[endpoint.id];
  const {
    selectedExample,
    selectedExampleKey,
    availableLanguages,
    setSelectedExampleKey,
  } = useExampleSelection(endpoint, example);

  const [baseUrl, selectedEnvironmentId] = usePlaygroundBaseUrl(endpoint);

  if (selectedExample == null) {
    return null;
  }

  return (
    <div className="mb-5 mt-3">
      <CodeSnippetExample
        title={
          <EndpointUrlWithOverflow
            path={endpoint.path}
            method={endpoint.method}
            environmentId={selectedEnvironmentId}
            baseUrl={baseUrl}
            options={endpoint.environments}
          />
        }
        actions={
          <>
            {availableLanguages.length > 1 && (
              <CodeExampleClientDropdown
                languages={availableLanguages}
                onValueChange={(language) =>
                  setSelectedExampleKey((prev) => ({
                    ...prev,
                    language,
                  }))
                }
                value={selectedExampleKey.language}
              />
            )}
            {slug != null && <ApiReferenceButton slug={slug} />}
          </>
        }
        code={selectedExample.code}
        language={selectedExampleKey.language}
        json={EMPTY_OBJECT}
        scrollAreaStyle={{ maxHeight: "500px" }}
      />
    </div>
  );
}
