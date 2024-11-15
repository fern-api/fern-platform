import { FacetsResponse, getFacets } from "@/utils/facet";
import { toFiltersString } from "@/utils/to-filter-string";
import { SWRResponse } from "swr";
import useSWRImmutable from "swr/immutable";

export function useFacets({
    appId,
    apiKey,
    domain,
    filters,
}: {
    appId: string;
    apiKey: string;
    domain: string;
    filters: { facet: string; value: string }[];
}): SWRResponse<FacetsResponse> {
    return useSWRImmutable([domain, toFiltersString(filters)], ([_domain, filters]) =>
        getFacets({ appId, apiKey, filters }),
    );
}
