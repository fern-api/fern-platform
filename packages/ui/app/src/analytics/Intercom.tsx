"use client";
import type { DocsV1Read } from "@fern-api/fdr-sdk";
import Intercom from "@intercom/messenger-js-sdk";
import { InitType } from "@intercom/messenger-js-sdk/types";
import { useEffect } from "react";

export function normalizeIntercomConfig(config: DocsV1Read.IntercomConfig): InitType {
    return {
        app_id: config.appId,
        api_base: config.apiBase,
    };
}

/**
 * If the given intercom config is defined, intialize the Intercom script via the official npm sdk
 * in a `useEffect`.
 * @param props
 */
export function useIntercomInitializer(props?: DocsV1Read.IntercomConfig): void {
    useEffect(() => {
        if (props) {
            Intercom(normalizeIntercomConfig(props));
        }
    });
}
