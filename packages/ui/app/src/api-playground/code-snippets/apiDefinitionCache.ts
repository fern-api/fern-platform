import { APIResponse, APIV1Read, FdrAPI } from "@fern-api/fdr-sdk";
import { REGISTRY_SERVICE } from "../../services/registry";

// TODO: clear this cache when it's no longer needed. This can cause a memory leak.
const apiDefinitionCache = new Map<
    FdrAPI.ApiDefinitionId,
    APIResponse<APIV1Read.ApiDefinition, APIV1Read.getApi.Error>
>();

export async function getApiDefinition(apiId: FdrAPI.ApiDefinitionId): Promise<APIV1Read.ApiDefinition | undefined> {
    const cachedApi = apiDefinitionCache.get(apiId);
    if (cachedApi != null) {
        return cachedApi.ok ? cachedApi.body : undefined;
    }

    const api = await REGISTRY_SERVICE.api.v1.read.getApi(apiId);
    apiDefinitionCache.set(apiId, api);
    return api.ok ? api.body : undefined;
}
