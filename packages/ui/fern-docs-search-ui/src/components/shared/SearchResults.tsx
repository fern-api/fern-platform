import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { ReactElement, RefObject, useDeferredValue } from "react";
import { useHits } from "react-instantsearch";
import { InitialSearchView } from "./InitialSearchView";
import { LinkComponentType } from "./LinkComponent";
import { NoResults } from "./NoResults";
import { SegmentedHits } from "./SegmentedHits";

export function SearchResults({
    inputRef,
    LinkComponent,
    initialResults,
}: {
    inputRef: RefObject<HTMLInputElement>;
    LinkComponent: LinkComponentType;
    initialResults: {
        tabs: { title: string; pathname: string }[];
        products: { id: string; title: string; pathname: string }[];
        versions: { id: string; title: string; pathname: string }[];
    };
}): ReactElement {
    const { items: rawHits, results } = useHits<AlgoliaRecord>();

    // avoid unnecessary re-renders while the user is typing
    const items = useDeferredValue(rawHits);

    if (!results || results?.query.length === 0) {
        return <InitialSearchView inputRef={inputRef} initialResults={initialResults} LinkComponent={LinkComponent} />;
    }

    if (items.length === 0) {
        return <NoResults />;
    }

    return <SegmentedHits inputRef={inputRef} LinkComponent={LinkComponent} />;
}
