/* eslint-disable react-hooks/rules-of-hooks */
import type { SearchConfig } from "@fern-ui/search-utils";
import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import { noop } from "ts-essentials";
import { useIsLocalPreview } from "../contexts/local-preview";
import { useApiRoute } from "../hooks/useApiRoute";

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

export function useSearchConfig(): [SearchConfig, refresh: () => void] {
    const isLocalPreview = useIsLocalPreview();

    if (isLocalPreview) {
        return [{ isAvailable: false }, noop];
    }

    const key = useApiRoute("/api/fern-docs/search");
    const { data } = useSWR<SearchConfig>(key, (url: string) => fetch(url).then((res) => res.json()), {
        refreshInterval: 1000 * 60 * 60 * 2, // 2 hours
        revalidateOnFocus: false,
    });

    const refresh = useCallback(() => {
        void mutate(key);
    }, [key]);

    return [data ?? { isAvailable: false }, refresh];
}
