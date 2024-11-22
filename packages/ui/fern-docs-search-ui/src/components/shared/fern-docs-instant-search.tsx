import { FacetFilter, useInitialFilters } from "@/hooks/use-facets";
import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import React, { Dispatch, SetStateAction, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useSearchClient } from "./search-client-provider";

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
                restrictHighlightAndSnippetArrays={true}
                distinct={true}
                attributesToSnippet={["description:20", "content:20"]}
                ignorePlurals
                facetFilters={facetFilters}
                facetingAfterDistinct
                maxFacetHits={100}
                maxValuesPerFacet={1000}
                userToken={authenticatedUserToken ?? userToken}
                optionalWords={["endpoint", "api", "guide", "parameter", "webhook", "websocket"]}
            />
            {React.cloneElement(children, { filters, setFilters, resetFilters })}
        </InstantSearchNext>
    );
}
