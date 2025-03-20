import { Client } from "@upstash/qstash";
import { getEnv } from "@vercel/functions";

import {
  HEADER_X_FERN_HOST,
  HEADER_X_VERCEL_PROTECTION_BYPASS,
  slugToHref,
} from "@fern-docs/utils";

import { qstashToken } from "@/server/env-variables";

import { cleanBasePath } from "./utils/clean-base-path";

const q = new Client({ token: qstashToken() });

export async function queue<TBody = unknown>({
  host,
  domain,
  basepath: basepathProp,
  endpoint: endpointProp,
  disableVercelPreviewDeployment = false,
  ...request
}: {
  /**
   * the host of the docs (might be different from the domain, in the case of reverse proxies)
   */
  host: string;
  /**
   * the domain of the docs (will be added to the x-fern-host header)
   */
  domain: string;
  basepath?: string;
  endpoint: `/api/fern-docs/${string}`;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: TBody;
  headers?: HeadersInit;
  retries?: number;
  deduplicationId?: string;
  disableVercelPreviewDeployment?: boolean;
}): Promise<string | undefined> {
  const { VERCEL, VERCEL_ENV, VERCEL_AUTOMATION_BYPASS_SECRET } = getEnv();

  if (!VERCEL || VERCEL_ENV === "development") {
    return undefined;
  }

  if (disableVercelPreviewDeployment && VERCEL_ENV !== "production") {
    return undefined;
  }

  const headers = new Headers(request?.headers);

  // add x-fern-host header to identify the docs domain (for compatibility with vercel preview urls)
  headers.set(HEADER_X_FERN_HOST, domain);

  if (VERCEL_AUTOMATION_BYPASS_SECRET) {
    headers.set(
      HEADER_X_VERCEL_PROTECTION_BYPASS,
      VERCEL_AUTOMATION_BYPASS_SECRET
    );
  }

  const basepath = cleanBasePath(basepathProp);
  const endpoint = slugToHref(endpointProp);

  const res = await q.publishJSON({
    url: `https://${host}${basepath}${endpoint}`,
    retries: 1,
    ...request,
    headers,
  });

  return res.messageId;
}

export async function batchQueue<TBody = unknown>({
  queueName,
  parallelism = 10,
  requests,
  disableVercelPreviewDeployment = false,
  ...baseRequest
}: {
  /**
   * queueName must be alphanumeric, hyphen, underscore, or period
   */
  queueName?: string;
  parallelism?: number;
  endpoint: `/api/fern-docs/${string}`;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  requests: {
    /**
     * the host of the docs (might be different from the domain, in the case of reverse proxies)
     */
    host: string;
    /**
     * the domain of the docs (will be added to the x-fern-host header)
     */
    domain: string;
    /**
     * the basepath of the docs (will be added to the url)
     */
    basepath?: string;

    /**
     * deduplicationId must be alphanumeric, hyphen, underscore, or period
     */
    deduplicationId?: string;
  }[];
  body?: TBody;
  headers?: HeadersInit;
  retries?: number;
  disableVercelPreviewDeployment?: boolean;
}): Promise<string[]> {
  const { VERCEL, VERCEL_ENV, VERCEL_AUTOMATION_BYPASS_SECRET } = getEnv();

  if (!VERCEL || VERCEL_ENV === "development") {
    return [];
  }

  if (disableVercelPreviewDeployment && VERCEL_ENV !== "production") {
    return [];
  }

  if (queueName) {
    await q.queue({ queueName }).upsert({ parallelism });
  }

  const batchRequests = requests.map(
    ({ host, domain, basepath: basepathProp, deduplicationId }) => {
      const headers = new Headers(baseRequest.headers);

      // add x-fern-host header to identify the docs domain (for compatibility with vercel preview urls)
      headers.set(HEADER_X_FERN_HOST, domain);

      if (VERCEL_AUTOMATION_BYPASS_SECRET) {
        headers.set(
          HEADER_X_VERCEL_PROTECTION_BYPASS,
          VERCEL_AUTOMATION_BYPASS_SECRET
        );
      }

      const basepath = cleanBasePath(basepathProp);
      const endpoint = slugToHref(baseRequest.endpoint);

      return {
        queueName,
        url: `https://${host}${basepath}${endpoint}`,
        retries: 1,
        ...baseRequest,
        headers,
        deduplicationId,
      };
    }
  );

  const responses = await q.batchJSON(batchRequests);

  return responses.map((res) => res.messageId);
}
