import { Client } from "@upstash/qstash";

import { qstashToken } from "@/server/env-variables";
import { addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import { conformTrailingSlash } from "./trailingSlash";

export const queueAlgoliaReindex = async (domain: string, basepath_: string = ""): Promise<string | undefined> => {
    if (process.env.VERCEL && process.env.VERCEL_ENV !== "development") {
        const client = new Client({ token: qstashToken() });

        const headers = new Headers();
        if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
            headers.set("x-vercel-protection-bypass", process.env.VERCEL_AUTOMATION_BYPASS_SECRET);
        }

        const basepath = addLeadingSlash(removeTrailingSlash(basepath_));
        const endpoint = addLeadingSlash(conformTrailingSlash("/api/fern-docs/search/v2/reindex"));

        const res = await client.publishJSON({
            url: `https://${domain}${basepath}${endpoint}`,
            method: "POST",
            headers,
        });

        return res.messageId;
    }

    return undefined;
};
