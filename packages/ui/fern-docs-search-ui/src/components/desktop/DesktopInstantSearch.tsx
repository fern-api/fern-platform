import { InitialResultsResponse } from "@/server/browse-results";
import { liteClient as algoliasearch } from "algoliasearch/lite";
import "instantsearch.css/themes/reset.css";
import { useEffect, useRef, type ReactElement } from "react";
import { Configure } from "react-instantsearch";
import { InstantSearchNext } from "react-instantsearch-nextjs";
import { DesktopCommand } from "./DesktopCommand";

interface DesktopInstantSearchProps {
    appId: string;
    apiKey: string;
    initialResults: InitialResultsResponse;
    onSubmit: (path: string) => void;
    onAskAI?: ({ initialInput }: { initialInput?: string }) => void;
}

export function DesktopInstantSearch({
    appId,
    apiKey,
    initialResults,
    onSubmit,
    onAskAI,
}: DesktopInstantSearchProps): ReactElement {
    const ref = useRef(algoliasearch(appId, apiKey));

    useEffect(() => {
        ref.current.setClientApiKey({ apiKey });
        void ref.current.clearCache();
    }, [apiKey]);

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
            />
            <DesktopCommand initialResults={initialResults} onSubmit={onSubmit} onAskAI={onAskAI} />
        </InstantSearchNext>
    );
}
