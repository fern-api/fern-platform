import { useDeepCompareEffectNoCheck } from "@/hooks/use-deep-compare-callback";
import { FacetFilter } from "@/hooks/use-facets";
import { EMPTY_FACETS_RESPONSE, FacetName, FacetsResponse, isFacetName } from "@/utils/facet-display";
import { toAlgoliaFacetFilters } from "@/utils/facet-filters";
import { EMPTY_OBJECT } from "@fern-api/ui-core-utils";
import { LiteClient, liteClient } from "algoliasearch/lite";
import { useAtom } from "jotai";
import { RESET, atomWithDefault } from "jotai/utils";
import {
    Dispatch,
    PropsWithChildren,
    ReactElement,
    ReactNode,
    SetStateAction,
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
} from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { preload } from "swr";
import useSWRImmutable from "swr/immutable";

function SearchClientRoot({
    children,
    fetchFacets,
    initialFilters,
    userToken,
    authenticatedUserToken,
    ...props
}: PropsWithChildren<{
    /**
     * Algolia App ID
     */
    appId: string;
    /**
     * Algolia API Key
     */
    apiKey: string;
    /**
     * Fern Docs Domain
     */
    domain: string;
    /**
     * Algolia Index Name
     */
    indexName: string;
    /**
     * Initial facet filters
     */
    initialFilters?: Partial<Record<FacetName, string>>;
    /**
     * Function to fetch facets
     */
    fetchFacets: (filters: readonly string[]) => Promise<FacetsResponse>;
    /**
     * Anonymous user token (for algolia insights)
     */
    userToken?: string;
    /**
     * Authenticated user token (for algolia insights)
     */
    authenticatedUserToken?: string;
    children: ReactNode;
}>): ReactNode {
    return (
        <SearchClientProvider {...props}>
            <FacetFiltersProvider fetchFacets={fetchFacets} initialFilters={initialFilters}>
                <InstantSearchWrapper userToken={userToken} authenticatedUserToken={authenticatedUserToken}>
                    {children}
                </InstantSearchWrapper>
            </FacetFiltersProvider>
        </SearchClientProvider>
    );
}

const SearchClientContext = createContext<
    { searchClient: LiteClient; apiKey: string; domain: string; indexName: string } | undefined
>(undefined);

/**
 * Provides the algolia search client, and refreshes the client cache when the api key changes.
 */
function SearchClientProvider({
    children,
    appId,
    apiKey,
    domain,
    indexName,
}: {
    children: ReactNode;
    appId: string;
    apiKey: string;
    domain: string;
    indexName: string;
}): ReactNode {
    const client = useRef(liteClient(appId, apiKey));

    useEffect(() => {
        client.current.setClientApiKey({ apiKey });
        void client.current.clearCache();
    }, [apiKey]);

    const value = useMemo(
        () => ({ searchClient: client.current, apiKey, domain, indexName }),
        [apiKey, domain, indexName],
    );

    return <SearchClientContext.Provider value={value}>{children}</SearchClientContext.Provider>;
}

function useSearchClient(): {
    searchClient: LiteClient;
    apiKey: string;
    domain: string;
    indexName: string;
} {
    const value = useContext(SearchClientContext);
    if (!value) {
        throw new Error("useSearchClient must be used within a SearchClientRoot");
    }
    return value;
}

const FacetFiltersContext = createContext({
    atom: atomWithDefault<readonly FacetFilter[]>(() => []),
    preloadFacets: (_: readonly FacetFilter[]) => Promise.resolve(EMPTY_FACETS_RESPONSE),
    fetchFacets: (_: readonly string[]) => Promise.resolve(EMPTY_FACETS_RESPONSE),
});

/**
 * Provides a context for facet filters. This should be used within PreloadFacetsProvider.
 */
function FacetFiltersProvider({
    children,
    initialFilters,
    fetchFacets,
}: {
    children: ReactNode;
    initialFilters?: Partial<Record<FacetName, string>>;
    fetchFacets: (filters: readonly string[]) => Promise<FacetsResponse>;
}): ReactNode {
    const preloadFacets = useCallback(
        (filters: readonly FacetFilter[]) =>
            preload(["facets", ...toAlgoliaFacetFilters(filters)], ([_, ...filters]) => fetchFacets(filters)),
        [fetchFacets],
    );

    // preload facets on initial render so that they're cached before the user runs `cmdk`
    useDeepCompareEffectNoCheck(() => {
        void preloadFacets(toFacetFilters(initialFilters));
    }, [initialFilters]);

    const ref = useRef(atomWithDefault(() => toFacetFilters(initialFilters)));
    const value = useMemo(() => ({ atom: ref.current, preloadFacets, fetchFacets }), [preloadFacets, fetchFacets]);
    return <FacetFiltersContext.Provider value={value}>{children}</FacetFiltersContext.Provider>;
}

/**
 * Returns the facet filters and functions to manipulate them.
 */
function useFacetFilters(): {
    filters: readonly FacetFilter[];
    setFilters: Dispatch<SetStateAction<readonly FacetFilter[]>>;
    clearFilters: () => void;
    resetFilters: () => void;
    popFilter: () => void;
} {
    const [filters, setFilters] = useAtom(useContext(FacetFiltersContext).atom);
    return useMemo(
        () => ({
            filters,
            setFilters,
            clearFilters: () => setFilters([]),
            resetFilters: () => setFilters(RESET),
            popFilter: () => setFilters((prev) => prev.slice(0, -1)),
        }),
        [filters, setFilters],
    );
}

/**
 * Returns a function to trigger preloading of facets for the given filters.
 */
function usePreloadFacets(): (filters: readonly FacetFilter[]) => Promise<FacetsResponse> {
    return useContext(FacetFiltersContext).preloadFacets;
}

/**
 * Returns the cached facets for the given filters.
 */
function useFacets(filters: readonly FacetFilter[]): {
    facets: FacetsResponse;
    isLoading: boolean;
} {
    const fetchFacets = useContext(FacetFiltersContext).fetchFacets;
    const res = useSWRImmutable(["facets", ...toAlgoliaFacetFilters(filters)], ([_, ...filters]) =>
        fetchFacets(filters),
    );
    return {
        facets: res.data ?? EMPTY_FACETS_RESPONSE,
        isLoading: res.isLoading,
    };
}

/**
 * Converts the given initial filters to facet filters.
 */
function toFacetFilters(initialFilters: Partial<Record<FacetName, string>> = EMPTY_OBJECT): readonly FacetFilter[] {
    const toRet: FacetFilter[] = [];

    Object.entries(initialFilters).forEach(([facet, value]) => {
        if (isFacetName(facet)) {
            toRet.push({ facet, value });
        }
    });

    return toRet;
}

/**
 * Wraps the InstantSearchNext component
 */
function InstantSearchWrapper({
    userToken,
    authenticatedUserToken,
    children,
}: PropsWithChildren<{
    userToken?: string;
    authenticatedUserToken?: string;
}>): ReactElement {
    const { searchClient, indexName } = useSearchClient();
    const { filters } = useFacetFilters();

    return (
        <InstantSearchNext
            searchClient={searchClient}
            indexName={indexName}
            future={{ preserveSharedStateOnUnmount: true }}
            insights={
                userToken || authenticatedUserToken
                    ? { insightsInitParams: [{ userToken, authenticatedUserToken }] }
                    : undefined
            }
        >
            <Configure
                attributesToSnippet={["description:32", "content:32"]}
                facetFilters={toAlgoliaFacetFilters(filters)}
                maxFacetHits={100}
                maxValuesPerFacet={1000}
                userToken={authenticatedUserToken ?? userToken}
                facetingAfterDistinct
                restrictHighlightAndSnippetArrays
                distinct
                ignorePlurals
                enableRules
                decompoundQuery
            />
            {children}
        </InstantSearchNext>
    );
}

export { SearchClientRoot, useFacetFilters, useFacets, usePreloadFacets, useSearchClient };
