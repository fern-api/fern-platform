"use server";

import { qstashToken } from "@/server/env-variables";
import { runReindex } from "@/server/run-reindex";
import { Client } from "@upstash/qstash";

export const handleReindex = async (domain: string): Promise<string | undefined> => {
    if (process.env.VERCEL && process.env.VERCEL_ENV !== "development") {
        const client = new Client({ token: qstashToken() });

        const domain =
            process.env.VERCEL_ENV === "production"
                ? process.env.VERCEL_PROJECT_PRODUCTION_URL
                : process.env.VERCEL_PROJECT_PREVIEW_URL;

        const res = await client.publish({
            url: `https://${domain}/api/reindex`,
            method: "POST",
            body: JSON.stringify({ domain }),
        });

        return res.messageId;
    }

    const response = await runReindex(domain);
    // eslint-disable-next-line no-console
    console.debug(response);

    return;
};
