"use client";
import type { DocsV1Read } from "@fern-api/fdr-sdk";
import Intercom from "@intercom/messenger-js-sdk";
import { InitType } from "@intercom/messenger-js-sdk/types";
import { useEffect } from "react";

/**
 * Transforms our internal representation of Intercom's Config into the type necessary to
 * bootstrap Intercom.
 *
 * @param config
 * @returns
 */
export function normalizeIntercomConfig(config: DocsV1Read.IntercomConfig): InitType {
    return {
        app_id: config.appId,
        api_base: config.apiBase,
    };
}

/**
 * If the given intercom config is defined, intialize the Intercom script via the official npm sdk
 * in a `useEffect`.
 *
 * @param config
 */
export function useIntercomInitializer(config?: DocsV1Read.IntercomConfig): void {
    useEffect(() => {
        if (config) {
            Intercom(normalizeIntercomConfig(config));
        }
    }, [config]);
}
