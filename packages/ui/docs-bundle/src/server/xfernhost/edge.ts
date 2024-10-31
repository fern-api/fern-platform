import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
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

    // eslint-disable-next-line no-console
    console.error("Could not determine xFernHost from request. Returning buildwithfern.com.");
    return "buildwithfern.com";
}

// use this for testing auth-based redirects on development and preview environments
export function getHostEdge(req: NextRequest): string {
    // if x-fern-host is set, assume it's proxied:
    return req.headers.get(HEADER_X_FERN_HOST) ?? req.headers.get("host") ?? req.nextUrl.host;
}
