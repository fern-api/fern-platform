import { FacetFilter, useInitialFilters } from "@/hooks/use-facets";
import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import React, { Dispatch, SetStateAction, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useSearchClient } from "./search-client-provider";
import { SearchContextProvider } from "./search-context-provider";

interface FernDocsInstantSearchProps {
    initialFilters?: Partial<Record<FacetName, string>>;
    userToken?: string;
    authenticatedUserToken?: string;
    children: ReactElement<{
        filters: FacetFilter[];
        setFilters?: Dispatch<SetStateAction<FacetFilter[]>>;
        resetFilters?: () => void;
    }>;
}

export function FernDocsInstantSearch({
    initialFilters,
    userToken,
    authenticatedUserToken,
    children,
}: FernDocsInstantSearchProps): ReactElement {
    const { searchClient, indexName } = useSearchClient();
    const { facetFilters, filters, setFilters, resetFilters } = useInitialFilters({ initialFilters });

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
                facetFilters={facetFilters}
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
            <SearchContextProvider filters={filters}>
                {React.cloneElement(children, { filters, setFilters, resetFilters })}
            </SearchContextProvider>
        </InstantSearchNext>
    );
}
