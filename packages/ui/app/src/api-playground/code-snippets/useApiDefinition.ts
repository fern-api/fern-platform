import { APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import useSWRImmutable from "swr/immutable";
import { REGISTRY_SERVICE } from "../../services/registry";

export function useApiDefinition(
    apiId: FdrAPI.ApiDefinitionId,
    isSnippetTemplatesEnabled: boolean,
): APIV1Read.ApiDefinition | undefined {
    const { data } = useSWRImmutable(apiId, (apiId) => {
        if (!isSnippetTemplatesEnabled) {
            return undefined;
        }
        return REGISTRY_SERVICE.api.v1.read.getApi(apiId);
    });

    if (data?.ok) {
        return data.body;
    }

    return undefined;
}
