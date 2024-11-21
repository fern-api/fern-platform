import { GroupedHits, generateHits } from "@/components/shared/hits";
import { FilterOption, toFilterOptions } from "@/utils/facet-display";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { useHits, useSearchBox } from "react-instantsearch";
import { FacetOpts, useFacets, usePreloadFacets } from "./useFacets";

export interface UseSearch {
    query: string;
    refine: (query: string) => void;
    clear: () => void;
    groups: GroupedHits[];
    facets: FilterOption[];
    preload: ({ filters }: FacetOpts) => Promise<FilterOption[]>;
    error: Error | null;
    isLoading: boolean;
}

export function useSearch({ filters }: FacetOpts): UseSearch {
    const { query, refine, clear } = useSearchBox();

    const { items } = useHits<AlgoliaRecord>();
    const groups = generateHits(query.trimStart().length > 0 || filters.length > 0 ? items : []);

    const { data: facetsResponse, error, isLoading } = useFacets({ filters });
    const facets = toFilterOptions(facetsResponse, "");

    const preloadFacets = usePreloadFacets();

    const preload = async (opts: FacetOpts) => {
        const preloadedFacetResponse = await preloadFacets(opts);
        return toFilterOptions(preloadedFacetResponse, "");
    };

    return {
        query,
        refine,
        clear,
        groups,
        facets,
        preload,
        error,
        isLoading,
    };
}
