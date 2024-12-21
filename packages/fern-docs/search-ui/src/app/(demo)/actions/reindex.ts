"use server";

import { Client } from "@upstash/qstash";

import { qstashToken } from "@/server/env-variables";
import { runReindexAlgolia } from "@/server/run-reindex-algolia";
import { runReindexTurbopuffer } from "@/server/run-reindex-turbopuffer";

export const handleReindex = async (
  domain: string
): Promise<string | undefined> => {
  if (process.env.VERCEL && process.env.VERCEL_ENV !== "development") {
    const client = new Client({ token: qstashToken() });

    const host =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL
        : process.env.VERCEL_PROJECT_PREVIEW_URL;

    const headers = new Headers();
    if (process.env.VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers.set(
        "x-vercel-protection-bypass",
        process.env.VERCEL_AUTOMATION_BYPASS_SECRET
      );
    }

    const res = await client.publishJSON({
      url: `https://${host}/api/reindex`,
      method: "POST",
      body: { domain },
      headers,
    });

    return res.messageId;
  }

  const response = await runReindexAlgolia(domain);
  // eslint-disable-next-line no-console
  console.debug(response);

  const response2 = await runReindexTurbopuffer(domain);
  // eslint-disable-next-line no-console
  console.debug(response2);

  return;
};
