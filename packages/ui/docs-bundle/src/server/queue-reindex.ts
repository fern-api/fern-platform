import { Client } from "@upstash/qstash";

import { qstashToken } from "@/server/env-variables";
import { HEADER_X_FERN_HOST, HEADER_X_VERCEL_PROTECTION_BYPASS, addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import { conformTrailingSlash } from "./trailingSlash";

const q = new Client({ token: qstashToken() });

async function queue<TBody = unknown>(
    host: string,
    domain: string,
    basepath_: string = "",
    endpoint_: `/api/fern-docs/${string}`,
    request?: {
        method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
        body?: TBody;
        headers?: HeadersInit;
        retries?: number;
    },
): Promise<string | undefined> {
    if (process.env.VERCEL && process.env.VERCEL_ENV !== "development") {
        const headers = new Headers(request?.headers);

        // add x-fern-host header to identify the docs domain (for compatibility with vercel preview urls)
        headers.set(HEADER_X_FERN_HOST, domain);

        if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
            headers.set(HEADER_X_VERCEL_PROTECTION_BYPASS, process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
        }

        const basepath = addLeadingSlash(removeTrailingSlash(basepath_));
        const endpoint = addLeadingSlash(conformTrailingSlash(endpoint_));

        const res = await q.publishJSON({
            url: `https://${host}${basepath}${endpoint}`,
            retries: 1,
            ...request,
            headers,
        });

        return res.messageId;
    }

    return undefined;
}

export const queueAlgoliaReindex = async (
    host: string,
    domain: string,
    basepath_: string = "",
): Promise<string | undefined> => {
    return queue(host, domain, basepath_, "/api/fern-docs/search/v2/reindex/algolia");
};

export const queueTurbopufferReindex = async (
    host: string,
    domain: string,
    basepath_: string = "",
): Promise<string | undefined> => {
    return queue(host, domain, basepath_, "/api/fern-docs/search/v2/reindex/turbopuffer");
};
