import type { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import useSWRImmutable from "swr/immutable";

import { provideRegistryService } from "@/server/registry";

export function useApiDefinition(
  apiId: FdrAPI.ApiDefinitionId,
  isSnippetTemplatesEnabled: boolean
): APIV1Read.ApiDefinition | undefined {
  const { data } = useSWRImmutable(apiId, (apiId) => {
    if (!isSnippetTemplatesEnabled) {
      return undefined;
    }
    return provideRegistryService().api.v1.read.getApi(apiId);
  });

  if (data?.ok) {
    return data.body;
  }

  return undefined;
}
