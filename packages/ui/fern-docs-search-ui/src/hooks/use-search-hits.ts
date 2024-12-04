import { AlgoliaRecordHit } from "@/components/types";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { useDeferredValue } from "react";
import { useHits } from "react-instantsearch";

export function useSearchHits(): AlgoliaRecordHit[] {
    const { items } = useHits<AlgoliaRecord>();
    return useDeferredValue(items);
}
