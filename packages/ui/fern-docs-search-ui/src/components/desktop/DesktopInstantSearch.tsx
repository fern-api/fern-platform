import { usePreloadFacets } from "@/hooks/useFacets";
import { FacetName } from "@/utils/facet-display";
import "instantsearch.css/themes/reset.css";
import { useTheme } from "next-themes";
import { useMemo, useState, type ReactElement } from "react";
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
}

export function DesktopInstantSearch({
    onSubmit,
    onAskAI,
    filters: initialFilters,
}: DesktopInstantSearchProps): ReactElement {
    const { searchClient } = useSearchClient();
    const preloadFacets = usePreloadFacets();

    const initialFiltersArray = useMemo(() => {
        const toRet: { facet: FacetName; value: string }[] = [];
        if (initialFilters?.["product.title"]) {
            toRet.push({ facet: "product.title", value: initialFilters["product.title"] });
        }
        if (initialFilters?.["version.title"]) {
            toRet.push({ facet: "version.title", value: initialFilters["version.title"] });
        }
        return toRet;
    }, [initialFilters]);

    const [filters, setFilters] = useState<{ facet: FacetName; value: string }[]>(initialFiltersArray);

    preloadFacets(initialFiltersArray);

    const { setTheme } = useTheme();

    return (
        <InstantSearchNext
            searchClient={searchClient}
            indexName="fern-docs-search"
            future={{ preserveSharedStateOnUnmount: true }}
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
