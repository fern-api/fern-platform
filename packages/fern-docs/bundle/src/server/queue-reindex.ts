import { qstashToken } from "@/server/env-variables";
import {
  HEADER_X_FERN_HOST,
  HEADER_X_VERCEL_PROTECTION_BYPASS,
  addLeadingSlash,
  conformTrailingSlash,
  removeTrailingSlash,
} from "@fern-docs/utils";
import { Client } from "@upstash/qstash";
import { getEnv } from "@vercel/functions";

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
  }
): Promise<string | undefined> {
  const { VERCEL, VERCEL_ENV, VERCEL_AUTOMATION_BYPASS_SECRET } = getEnv();
  if (VERCEL && VERCEL_ENV !== "development") {
    const headers = new Headers(request?.headers);

    // add x-fern-host header to identify the docs domain (for compatibility with vercel preview urls)
    headers.set(HEADER_X_FERN_HOST, domain);

    if (VERCEL_AUTOMATION_BYPASS_SECRET) {
      headers.set(
        HEADER_X_VERCEL_PROTECTION_BYPASS,
        VERCEL_AUTOMATION_BYPASS_SECRET
      );
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
  basepath_: string = ""
): Promise<string | undefined> => {
  return queue(
    host,
    domain,
    basepath_,
    "/api/fern-docs/search/v2/reindex/algolia",
    {
      method: "GET",
    }
  );
};

export const queueTurbopufferReindex = async (
  host: string,
  domain: string,
  basepath_: string = ""
): Promise<string | undefined> => {
  return queue(
    host,
    domain,
    basepath_,
    "/api/fern-docs/search/v2/reindex/turbopuffer",
    {
      method: "GET",
    }
  );
};
