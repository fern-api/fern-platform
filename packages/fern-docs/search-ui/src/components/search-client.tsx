"use client";

import {
  Dispatch,
  KeyboardEventHandler,
  PropsWithChildren,
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

import { LiteClient, liteClient } from "algoliasearch/lite";
import { uniq } from "es-toolkit/array";
import { useAtom, useSetAtom } from "jotai";
import { RESET, atomWithDefault } from "jotai/utils";
import { preload } from "swr";
import useSWRImmutable from "swr/immutable";

import { EMPTY_OBJECT, getDevice, getPlatform } from "@fern-api/ui-core-utils";
import type {
  FacetName,
  FacetsResponse,
} from "@fern-docs/search-server/algolia";
import {
  useDeepCompareEffectNoCheck,
  useEventCallback,
  useLazyRef,
} from "@fern-ui/react-commons";

import { FacetFilter, isFacetName } from "../types";
import { toAlgoliaFacetFilters } from "../utils/facet-filters";

function SearchClientRoot({
  children,
  fetchFacets,
  initialFilters,
  authenticatedUserToken,
  analyticsTags,
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
   * Authenticated user token (for algolia insights)
   */
  authenticatedUserToken?: string;
  children: ReactNode;
  /**
   * Additional analytics tags to track metrics for this search client.
   */
  analyticsTags?: string[];
}>): ReactNode {
  return (
    <SearchClientProvider {...props}>
      <FacetFiltersProvider
        fetchFacets={fetchFacets}
        initialFilters={initialFilters}
      >
        <InstantSearchWrapper
          authenticatedUserToken={authenticatedUserToken}
          analyticsTags={uniq([
            getPlatform(),
            getDevice(),
            props.domain,
            ...(analyticsTags ?? []),
          ])}
        >
          {children}
        </InstantSearchWrapper>
      </FacetFiltersProvider>
    </SearchClientProvider>
  );
}

const SearchClientContext = createContext<
  | {
      searchClient: LiteClient;
      apiKey: string;
      domain: string;
      indexName: string;
    }
  | undefined
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
  const client = useLazyRef(() => liteClient(appId, apiKey));

  useEffect(() => {
    client.current.setClientApiKey({ apiKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  const value = useMemo(
    () => ({ searchClient: client.current, apiKey, domain, indexName }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [apiKey, domain, indexName]
  );

  return (
    <SearchClientContext.Provider value={value}>
      {children}
    </SearchClientContext.Provider>
  );
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
  preloadFacets: (_: readonly FacetFilter[]): Promise<FacetsResponse> =>
    Promise.resolve({}),
  fetchFacets: (_: readonly string[]): Promise<FacetsResponse> =>
    Promise.resolve({}),
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
      preload(
        ["facets", ...toAlgoliaFacetFilters(filters)],
        ([_, ...filters]) => fetchFacets(filters)
      ),
    [fetchFacets]
  );

  const initialFiltersGetter = useEventCallback(() =>
    toFacetFilters(initialFilters)
  );
  const ref = useRef(atomWithDefault(initialFiltersGetter));
  const setFilters = useSetAtom(ref.current);

  // preload facets on initial render so that they're cached before the user runs `cmdk`
  useDeepCompareEffectNoCheck(() => {
    const filters = toFacetFilters(initialFilters);
    void preloadFacets(filters);
    setFilters(filters);
  }, [initialFilters]);

  const value = useMemo(
    () => ({ atom: ref.current, preloadFacets, fetchFacets }),
    [preloadFacets, fetchFacets]
  );
  return (
    <FacetFiltersContext.Provider value={value}>
      {children}
    </FacetFiltersContext.Provider>
  );
}

/**
 * Returns the facet filters and functions to manipulate them.
 */
function useFacetFilters(
  atom?: ReturnType<typeof atomWithDefault<readonly FacetFilter[]>>
): {
  filters: readonly FacetFilter[];
  setFilters: Dispatch<SetStateAction<readonly FacetFilter[]>>;
  clearFilters: () => void;
  resetFilters: () => void;
  popFilter: () => void;
  handlePopState: KeyboardEventHandler<HTMLElement>;
} {
  const contextAtom = useContext(FacetFiltersContext).atom;

  const [filters, setFilters] = useAtom(atom ?? contextAtom);
  return useMemo(() => {
    const clearFilters = () => setFilters([]);
    const resetFilters = () => setFilters(RESET);
    const popFilter = () => setFilters((prev) => prev.slice(0, -1));
    return {
      filters,
      setFilters,
      clearFilters,
      resetFilters,
      popFilter,
      handlePopState: (e) => {
        if (e.metaKey || e.ctrlKey) {
          clearFilters();
        } else {
          popFilter();
        }
      },
    };
  }, [filters, setFilters]);
}

/**
 * Returns a function to trigger preloading of facets for the given filters.
 */
function usePreloadFacets(): (
  filters: readonly FacetFilter[]
) => Promise<FacetsResponse> {
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
  const res = useSWRImmutable(
    ["facets", ...toAlgoliaFacetFilters(filters)],
    ([_, ...filters]) => fetchFacets(filters)
  );
  return {
    facets: res.data ?? {},
    isLoading: res.isLoading,
  };
}

/**
 * Converts the given initial filters to facet filters.
 */
function toFacetFilters(
  initialFilters: Partial<Record<FacetName, string>> = EMPTY_OBJECT
): readonly FacetFilter[] {
  const toRet: FacetFilter[] = [];

  Object.entries(initialFilters).forEach(([facet, value]) => {
    if (isFacetName(facet) && value) {
      toRet.push({ facet, value });
    }
  });

  return toRet;
}

/**
 * Wraps the InstantSearchNext component
 */
function InstantSearchWrapper({
  authenticatedUserToken,
  children,
  analyticsTags,
}: PropsWithChildren<{
  authenticatedUserToken?: string;
  analyticsTags?: string[];
}>) {
  const { searchClient, indexName } = useSearchClient();
  const { filters } = useFacetFilters();

  return (
    <InstantSearchNext
      searchClient={searchClient}
      indexName={indexName}
      insights={
        authenticatedUserToken
          ? { insightsInitParams: { authenticatedUserToken } }
          : undefined
      }
      // CAUTION: do not turn routing on because it interferes with the nextjs app router.
      // for example, it will restore an old url even though you've navigated to a new page.
      routing={false}
    >
      <Configure
        attributesToSnippet={["description:32", "content:32"]}
        facetFilters={toAlgoliaFacetFilters(filters)}
        maxValuesPerFacet={1000}
        facetingAfterDistinct
        restrictHighlightAndSnippetArrays
        distinct
        ignorePlurals
        enableRules
        decompoundQuery
        analytics
        analyticsTags={analyticsTags}
      />
      {children}
    </InstantSearchNext>
  );
}

export {
  SearchClientRoot,
  useFacetFilters,
  useFacets,
  usePreloadFacets,
  useSearchClient,
};
