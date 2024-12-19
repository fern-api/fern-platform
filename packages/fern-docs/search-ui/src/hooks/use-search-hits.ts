import type { AlgoliaRecord } from "@fern-docs/search-server/algolia/types";
import { useEffect, useLayoutEffect, useState } from "react";
import { useHits } from "react-instantsearch";

import { AlgoliaRecordHit } from "../types";

const usePolymorphicEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useSearchHits(): AlgoliaRecordHit[] {
  const { items } = useHits<AlgoliaRecord>();
  return items;
}

// this is a hack to force the `<Command>` component to re-render when the hits change, so that it can change its selected hit
// this doesn't work all the time, but slightly improves the UX otherwise the selection is sometimes 1-render behind.
export function useSearchHitsRerender(): void {
  const items = useSearchHits();
  const [, setRerender] = useState(0);
  usePolymorphicEffect(() => {
    setRerender((prev) => prev + 1);
  }, [items]);
}
