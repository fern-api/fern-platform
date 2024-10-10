import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
import type { NextRequest } from "next/server";
import { getNextPublicDocsDomain } from "./dev";
import { cleanHost } from "./util";

/**
 * Note: x-fern-host is always appended to the request header by cloudfront for all *.docs.buildwithfern.com requests.
 */
export function getDocsDomainEdge(req: NextRequest, useSearchParams = false): string {
    const hosts = [
        useSearchParams ? req.nextUrl.searchParams.get("host") : undefined,
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

    throw new Error("Could not determine xFernHost from request.");
}

// use this for testing auth-based redirects on development and preview environments
export function getHostEdge(req: NextRequest): string {
    if (
        process.env.NODE_ENV === "development" ||
        process.env.VERCEL_ENV === "preview" ||
        process.env.VERCEL_ENV === "development"
    ) {
        return req.nextUrl.host;
    }
    return getDocsDomainEdge(req);
}
