import { FacetName } from "@/utils/facet";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import "instantsearch.css/themes/reset.css";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { DesktopCommand } from "./DesktopCommand";

interface DesktopInstantSearchProps {
    domain: string;
    appId: string;
    apiKey: string;
    onSubmit: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
    filters?: {
        "product.title"?: string;
        "version.title"?: string;
    };
}

export function DesktopInstantSearch({
    domain,
    appId,
    apiKey,
    onSubmit,
    onAskAI,
    filters: initialFilters,
}: DesktopInstantSearchProps): ReactElement {
    const ref = useRef(algoliasearch(appId, apiKey));
    const [filters, setFilters] = useState<{ facet: FacetName; value: string }[]>(() => {
        const toRet: { facet: FacetName; value: string }[] = [];
        if (initialFilters?.["product.title"]) {
            toRet.push({ facet: "product.title", value: initialFilters["product.title"] });
        }
        if (initialFilters?.["version.title"]) {
            toRet.push({ facet: "version.title", value: initialFilters["version.title"] });
        }
        return toRet;
    });

    useEffect(() => {
        ref.current.setClientApiKey({ apiKey });
        void ref.current.clearCache();
    }, [apiKey]);

    const { setTheme } = useTheme();

    return (
        <InstantSearchNext
            searchClient={ref.current}
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
                domain={domain}
                appId={appId}
                apiKey={apiKey}
                onSubmit={onSubmit}
                onAskAI={onAskAI}
                filters={filters}
                setFilters={setFilters}
                setTheme={setTheme}
            />
        </InstantSearchNext>
    );
}
