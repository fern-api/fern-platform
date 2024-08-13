"use client";

import { DocsV1Read } from "@fern-api/fdr-sdk";
import { init } from "@fullstory/browser";
import { useEffect } from "react";

export function useFullstoryInitializer(config?: DocsV1Read.FullStoryAnalyticsConfig): void {
    useEffect(() => {
        if (config) {
            init(config);
        }
    });
}
