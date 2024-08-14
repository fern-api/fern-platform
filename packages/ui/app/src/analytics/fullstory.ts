"use client";

import { DocsV1Read } from "@fern-api/fdr-sdk";
import { init } from "@fullstory/browser";
import { useEffect } from "react";

/**
 * If the given config is defined, initialize [Fullstory](https://github.com/fullstorydev/fullstory-browser-sdk)
 * with it via `useEffect`.
 *
 * @param config
 */
export function useFullstoryInitializer(config?: DocsV1Read.FullStoryAnalyticsConfig): void {
    useEffect(() => {
        if (config) {
            init(config);
        }
    }, [config]);
}
