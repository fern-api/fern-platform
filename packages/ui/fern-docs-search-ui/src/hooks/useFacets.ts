import { useSearchClient } from "@/components/shared/search-client-provider";
import { FacetName, FacetsResponse, isFacetName } from "@/utils/facet-display";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { SWRResponse, preload } from "swr";
import useSWRImmutable from "swr/immutable";

export interface FacetFilter {
    facet: FacetName;
    value: string;
}

export interface FacetOpts {
    filters: readonly FacetFilter[];
}

async function fetchFacets({
    filters,
    domain,
    apiKey,
}: {
    filters: string | undefined;
    domain: string;
    apiKey: string;
}): Promise<FacetsResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set("domain", domain);
    if (filters?.length) {
        searchParams.set("filters", filters);
    }
    searchParams.set("x-algolia-api-key", apiKey);
    const search = String(searchParams);

    const res = await fetch(`/api/facet-values?${search}`);
    return await res.json();
}

export function useFacets(opts: FacetOpts): SWRResponse<FacetsResponse> {
    const { domain, apiKey } = useSearchClient();
    return useSWRImmutable([toFiltersString(opts), domain], ([filters, domain]) =>
        fetchFacets({ filters, domain, apiKey }),
    );
}

export function usePreloadFacets(): (opts: FacetOpts) => Promise<FacetsResponse> {
    const { domain, apiKey } = useSearchClient();
    return (opts) => preload([toFiltersString(opts), domain], ([filters]) => fetchFacets({ filters, domain, apiKey }));
}

function toFiltersString({ filters }: FacetOpts): string {
    return filters
        .map((filter) => `${filter.facet}:"${filter.value}"`)
        .sort()
        .join(" AND ");
}

export function useInitialFilters({ initialFilters }: { initialFilters?: Partial<Record<FacetName, string>> }): {
    filters: FacetFilter[];
    filtersString: string | undefined;
    setFilters: Dispatch<SetStateAction<FacetFilter[]>>;
} {
    const preload = usePreloadFacets();

    const initialFiltersArray = useMemo(() => {
        const toRet: FacetFilter[] = [];

        Object.entries(initialFilters ?? {}).forEach(([facet, value]) => {
            if (isFacetName(facet)) {
                toRet.push({ facet, value });
            }
        });

        return toRet;
    }, [initialFilters]);

    const [filters, setFilters] = useState<FacetFilter[]>(initialFiltersArray);

    void preload({ filters: initialFiltersArray });

    return {
        filters,
        setFilters,
        filtersString: filters.length === 0 ? undefined : toFiltersString({ filters }),
    };
}
