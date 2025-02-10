import { useHits } from "react-instantsearch";

import type { AlgoliaRecord } from "@fern-docs/search-server/algolia/types";

import { AlgoliaRecordHit } from "../types";

export function useSearchHits(): AlgoliaRecordHit[] {
  const { items } = useHits<AlgoliaRecord>();
  return items;
}
