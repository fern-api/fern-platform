import { useSearchClient } from "@/components/shared/SearchClientProvider";
import { FacetsResponse } from "@/utils/facet-display";
import { toFiltersString } from "@/utils/to-filter-string";
import { SWRResponse, preload } from "swr";
import useSWRImmutable from "swr/immutable";

async function fetchFacets({
    filters,
    domain,
}: {
    filters: string | undefined;
    domain: string;
}): Promise<FacetsResponse> {
    const res = await fetch(`/api/facet-values?domain=${domain}${filters?.length ? `&filters=${filters}` : ""}`);
    return await res.json();
}

export function useFacets({ filters }: { filters: { facet: string; value: string }[] }): SWRResponse<FacetsResponse> {
    const { domain } = useSearchClient();
    return useSWRImmutable([toFiltersString(filters), domain], ([filters, domain]) => fetchFacets({ filters, domain }));
}

export function usePreloadFacets(): (filters: { facet: string; value: string }[]) => Promise<FacetsResponse> {
    const { domain } = useSearchClient();
    return (filters) => preload([toFiltersString(filters), domain], ([filters]) => fetchFacets({ filters, domain }));
}
