"use server";

import { qstashToken } from "@/server/env-variables";
import { runReindex } from "@/server/run-reindex";
import { Client } from "@upstash/qstash";

export const handleReindex = async (domain: string): Promise<string | undefined> => {
    if (process.env.VERCEL && process.env.VERCEL_ENV !== "development") {
        const client = new Client({ token: qstashToken() });

        const res = await client.publish({
            url: `https://${process.env.VERCEL_URL}/api/reindex?domain=${domain}`,
            method: "GET",
        });

        return res.messageId;
    }

    const response = await runReindex(domain);
    // eslint-disable-next-line no-console
    console.debug(response);

    return;
};
