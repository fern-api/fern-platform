import { useDeferredValue } from "react";
import { useHits } from "react-instantsearch";

import type { SendEventForHits } from "instantsearch.js/es/lib/utils";

import type { AlgoliaRecord } from "@fern-docs/search-server/algolia/types";

import type { AlgoliaRecordHit } from "../types";

export function useSearchHits(): AlgoliaRecordHit[] {
  const { items } = useHits<AlgoliaRecord>();
  return useDeferredValue(items);
}

export function useSendEvent(): SendEventForHits {
  const { sendEvent } = useHits();
  return sendEvent;
}
