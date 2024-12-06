import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { useEffect, useLayoutEffect, useState } from "react";
import { useHits } from "react-instantsearch";

import { AlgoliaRecordHit } from "../types";

const usePolymorphicEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useSearchHits(): AlgoliaRecordHit[] {
    const { items } = useHits<AlgoliaRecord>();
    return items;
}

export function useSearchHitsRerender(): void {
    const items = useSearchHits();
    const [, setRerender] = useState(0);
    usePolymorphicEffect(() => {
        setRerender((prev) => prev + 1);
    }, [items]);
}
