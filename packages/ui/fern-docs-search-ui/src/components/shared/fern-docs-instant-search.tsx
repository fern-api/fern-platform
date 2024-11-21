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
    }>;
}

export function FernDocsInstantSearch({
    initialFilters,
    userToken,
    authenticatedUserToken,
    children,
}: FernDocsInstantSearchProps): ReactElement {
    const { searchClient, indexName } = useSearchClient();
    const { filtersString, filters, setFilters } = useInitialFilters({ initialFilters });

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
                filters={filtersString}
                maxFacetHits={100}
                maxValuesPerFacet={1000}
            />
            {React.cloneElement(children, { filters, setFilters })}
        </InstantSearchNext>
    );
}
