/* eslint-disable react-hooks/rules-of-hooks */
import { noop } from "@fern-ui/core-utils";
import type { SearchConfig } from "@fern-ui/search-utils";
import { useAtomValue } from "jotai";
import { useCallback } from "react";
import useSWR, { mutate } from "swr";
import urljoin from "url-join";
import { useBasePath } from "../atoms/navigation";
import { IS_LOCAL_PREVIEW_ATOM } from "../atoms/preview";
import { useDocsContext } from "../contexts/docs-context/useDocsContext";

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
    const { searchInfo } = useDocsContext();
    const basePath = useBasePath();
    const isLocalPreview = useAtomValue(IS_LOCAL_PREVIEW_ATOM);

    if (isLocalPreview) {
        return [{ isAvailable: false }, noop];
    }

    const key = urljoin(basePath ?? "/", "/api/fern-docs/search");

    const { data } = useSWR<SearchConfig>(
        key,
        async (url: string) => {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    searchInfo,
                }),
            });
            return res.json();
        },
        {
            refreshInterval: 1000 * 60 * 60 * 2, // 2 hours
            revalidateOnFocus: false,
        },
    );

    const refresh = useCallback(() => {
        void mutate(key);
    }, [key]);

    return [data ?? { isAvailable: false }, refresh];
}
