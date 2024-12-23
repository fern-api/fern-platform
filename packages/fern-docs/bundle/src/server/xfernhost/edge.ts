import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-docs/utils";
import type { NextRequest } from "next/server";
import { getNextPublicDocsDomain } from "./dev";
import { cleanHost } from "./util";

/**
 * Note: x-fern-host is always appended to the request header by cloudfront for all *.docs.buildwithfern.com requests.
 */
export function getDocsDomainEdge(req: NextRequest): string {
  const hosts = [
    getNextPublicDocsDomain(),
    req.cookies.get(COOKIE_FERN_DOCS_PREVIEW)?.value,
    req.headers.get(HEADER_X_FERN_HOST),
    req.nextUrl.host,
  ];

  for (let host of hosts) {
    host = cleanHost(host);
    if (host != null) {
      return host;
    }
  }

  console.error(
    "Could not determine xFernHost from request. Returning buildwithfern.com."
  );
  return "buildwithfern.com";
}

// if x-fern-host is set, assume it's proxied:
export function getHostEdge(req: NextRequest): string {
  return req.headers.get(HEADER_X_FERN_HOST) ?? req.nextUrl.host;
}
