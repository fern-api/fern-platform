import { ReactElement } from "react";

import type * as ApiDefinition from "@fern-api/fdr-sdk/api-definition";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";

import { ApiReferenceButton } from "@/components/ApiReferenceButton";
import { CodeExampleClientDropdown } from "@/components/api-reference/endpoints/CodeExampleClientDropdown";
import { EndpointUrlWithOverflow } from "@/components/api-reference/endpoints/EndpointUrlWithOverflow";
import { useExampleSelection } from "@/components/api-reference/endpoints/useExampleSelection";
import { CodeSnippetExample } from "@/components/api-reference/examples/CodeSnippetExample";
import { usePlaygroundBaseUrl } from "@/components/playground/utils/select-environment";
import { useCurrentVersionSlug } from "@/state/navigation";

export function EndpointRequestSnippet({
  example,
  endpointDefinition,
  slugs,
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
   * @internal the rehype-endpoint-snippets plugin will set this
   */
  slugs?: string[];
}) {
  if (endpointDefinition == null) {
    return null;
  }

  return (
    <EndpointRequestSnippetInternal
      endpoint={endpointDefinition}
      slugs={slugs ?? []}
      example={example}
    />
  );
}

function EndpointRequestSnippetInternal({
  endpoint,
  example,
  slugs,
}: {
  endpoint: ApiDefinition.EndpointDefinition;
  example: string | undefined;
  slugs: string[];
}): ReactElement<any> | null {
  const slug = useCurrentSlug(slugs);
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
        // include both dropdown and api ref button for proper placement
        languageDropdown={
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

function useCurrentSlug(slugs: string[]): string | undefined {
  const currentVersionSlug = useCurrentVersionSlug();

  if (slugs.length === 0) {
    return undefined;
  }

  if (slugs.length === 1 && slugs[0]) {
    return slugs[0];
  }

  if (currentVersionSlug == null) {
    return slugs[0];
  }

  const slug = slugs.find((slug) => slug.startsWith(currentVersionSlug + "/"));
  return slug ?? slugs[0];
}
