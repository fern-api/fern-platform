/* eslint-disable react-hooks/rules-of-hooks */
import type { SearchConfig } from "@fern-docs/search-utils";
import { useEdgeFlags } from "../atoms";
import { useIsLocalPreview } from "../contexts/local-preview";
import { useApiRouteSWR } from "../hooks/useApiRouteSWR";

export type SearchCredentials = {
  appId: string;
  searchApiKey: string;
};

export declare namespace SearchService {
  export interface Available {
    isAvailable: true;
    loadCredentials: () => Promise<SearchCredentials | undefined>;
    index: string;
  }

  export interface Unavailable {
    isAvailable: false;
  }
}

export type SearchService = SearchService.Available | SearchService.Unavailable;

export function useSearchConfig(): SearchConfig {
  const isLocalPreview = useIsLocalPreview();
  const { isSearchDisabled } = useEdgeFlags();

  if (isLocalPreview || isSearchDisabled) {
    return { isAvailable: false };
  }

  const { data } = useApiRouteSWR<SearchConfig>(
    "/api/fern-docs/search/v1/key",
    {
      refreshInterval: 1000 * 60 * 60 * 2, // 2 hours
      revalidateOnFocus: false,
    }
  );

  return data ?? { isAvailable: false };
}
