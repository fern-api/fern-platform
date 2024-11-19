import { useInitialFilters } from "@/hooks/useFacets";
import "instantsearch.css/themes/reset.css";
import { useTheme } from "next-themes";
import { type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { useSearchClient } from "../shared/SearchClientProvider";
import { DesktopCommand } from "./DesktopCommand";

interface DesktopInstantSearchProps {
    onSubmit: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    filters?: {
        "product.title"?: string;
        "version.title"?: string;
    };
    userToken?: string;
    authenticatedUserToken?: string;
}

export function DesktopInstantSearch({
    onSubmit,
    onAskAI,
    filters: initialFilters,
    userToken,
    authenticatedUserToken,
}: DesktopInstantSearchProps): ReactElement {
    const { searchClient } = useSearchClient();

    const { filters, setFilters } = useInitialFilters({ initialFilters });

    const { setTheme } = useTheme();

    return (
        <InstantSearchNext
            searchClient={searchClient}
            indexName="fern-docs-search"
            future={{ preserveSharedStateOnUnmount: true }}
            insights={{
                insightsInitParams: [{ userToken, authenticatedUserToken }],
            }}
        >
            <Configure
                restrictHighlightAndSnippetArrays={true}
                distinct={true}
                attributesToSnippet={["description:24", "content:24"]}
                ignorePlurals
                filters={
                    filters.length === 0
                        ? undefined
                        : filters.map((filter) => `${filter.facet}:"${filter.value}"`).join(" AND ")
                }
                maxFacetHits={100}
                maxValuesPerFacet={1000}
            />
            <DesktopCommand
                onSubmit={onSubmit}
                onAskAI={onAskAI}
                filters={filters}
                setFilters={setFilters}
                setTheme={setTheme}
            />
        </InstantSearchNext>
    );
}
