import { FacetFilter, useInitialFilters } from "@/hooks/useFacets";
import "instantsearch.css/themes/reset.css";
import React, { Dispatch, SetStateAction, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useSearchClient } from "../shared/SearchClientProvider";

interface FernDocsInstantSearchProps {
    initialFilters?: {
        "product.title"?: string;
        "version.title"?: string;
    };
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
                attributesToSnippet={["description:24", "content:24"]}
                ignorePlurals
                filters={filtersString}
                maxFacetHits={100}
                maxValuesPerFacet={1000}
            />
            {React.cloneElement(children, { filters, setFilters })}
        </InstantSearchNext>
    );
}
