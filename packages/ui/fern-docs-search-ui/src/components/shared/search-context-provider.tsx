import { FacetFilter, FacetOpts, useFacets, usePreloadFacets } from "@/hooks/use-facets";
import { FilterOption, toFilterOptions } from "@/utils/facet-display";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { ReactNode, createContext, useContext, useDeferredValue } from "react";
import { useHits, useSearchBox } from "react-instantsearch";
import { noop } from "ts-essentials";
import { AlgoliaRecordHit } from "../types";

export interface SearchContextValue {
    query: string;
    refine: (query: string) => void;
    clear: () => void;
    items: AlgoliaRecordHit[];
    facets: FilterOption[];
    preload: ({ filters }: FacetOpts) => Promise<FilterOption[]>;
    error: Error | null;
    isLoading: boolean;
}

const SearchContext = createContext<SearchContextValue>({
    query: "",
    refine: noop,
    clear: noop,
    items: [],
    facets: [],
    preload: async () => [],
    error: null,
    isLoading: false,
});

export function SearchContextProvider({
    children,
    filters,
}: {
    children: ReactNode;
    filters: FacetFilter[];
}): ReactNode {
    const { query, refine, clear } = useSearchBox();

    const { items: _items } = useHits<AlgoliaRecord>();
    const items = useDeferredValue(_items);

    const { data: facetsResponse, error, isLoading } = useFacets({ filters });

    const facets = toFilterOptions(facetsResponse);

    const preloadFacets = usePreloadFacets();
    const preload = async (opts: FacetOpts) => {
        const preloadedFacetResponse = await preloadFacets({
            filters: [...filters, ...opts.filters],
        });
        return toFilterOptions(preloadedFacetResponse);
    };

    // note: since hits change on every keystroke, theres no need to memoize
    return (
        <SearchContext.Provider value={{ query, refine, clear, items, facets, preload, error, isLoading }}>
            {children}
        </SearchContext.Provider>
    );
}

export function useSearchContext(): SearchContextValue {
    return useContext(SearchContext);
}
