import type { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk/client/types";
import useSWRImmutable from "swr/immutable";
import { provideRegistryService } from "../../services/registry";

export function useApiDefinition(
    apiId: FdrAPI.ApiDefinitionId,
    isSnippetTemplatesEnabled: boolean,
): APIV1Read.ApiDefinition | undefined {
    const { data } = useSWRImmutable(isSnippetTemplatesEnabled ? apiId : null, (apiId) =>
        provideRegistryService().api.v1.read.getApi(apiId),
    );

    if (data?.ok) {
        return data.body;
    }

    return undefined;
}
