import { useSearchClient } from "@/components/shared/SearchClientProvider";
import { FacetName, FacetsResponse } from "@/utils/facet-display";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { SWRResponse, preload } from "swr";
import useSWRImmutable from "swr/immutable";

export interface FacetFilter {
    facet: FacetName;
    value: string;
}

export interface FacetOpts {
    filters: FacetFilter[];
}

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

export function useFacets(opts: FacetOpts): SWRResponse<FacetsResponse> {
    const { domain } = useSearchClient();
    return useSWRImmutable([toFiltersString(opts), domain], ([filters, domain]) => fetchFacets({ filters, domain }));
}

export function usePreloadFacets(): (opts: FacetOpts) => Promise<FacetsResponse> {
    const { domain } = useSearchClient();
    return (opts) => preload([toFiltersString(opts), domain], ([filters]) => fetchFacets({ filters, domain }));
}

function toFiltersString({ filters }: FacetOpts): string {
    return filters
        .map((filter) => `${filter.facet}:"${filter.value}"`)
        .sort()
        .join(" AND ");
}

export function useInitialFilters({
    initialFilters,
}: {
    initialFilters?: { "product.title"?: string; "version.title"?: string };
}): {
    filters: FacetFilter[];
    setFilters: Dispatch<SetStateAction<FacetFilter[]>>;
} {
    const preload = usePreloadFacets();

    const initialFiltersArray = useMemo(() => {
        const toRet: FacetFilter[] = [];
        if (initialFilters?.["product.title"]) {
            toRet.push({ facet: "product.title", value: initialFilters["product.title"] });
        }
        if (initialFilters?.["version.title"]) {
            toRet.push({ facet: "version.title", value: initialFilters["version.title"] });
        }
        return toRet;
    }, [initialFilters]);

    const [filters, setFilters] = useState<FacetFilter[]>(initialFiltersArray);

    void preload({ filters: initialFiltersArray });

    return {
        filters,
        setFilters,
    };
}
