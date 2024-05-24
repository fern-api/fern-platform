import type { NextApiRequest } from "next";
import type { NextRequest } from "next/server";

/**
 * Notes:
 *
 * x-fern-host is always appended to the request header by cloudfront for all *.docs.buildwithfern.com requests.
 * if the request is a rewrite from a custom domain, then x-forwarded-host is appended to the request header.
 * prefer x-forwarded-host over x-fern-host.
 *
 * NEXT_PUBLIC_DOCS_DOMAIN is used for local development only.
 * _fern_docs_preview is used for previewing the docs.
 */

export function getXFernHostEdge(req: NextRequest, useSearchParams = false): string {
    const hosts = [
        useSearchParams ? req.nextUrl.searchParams.get("host") : undefined,
        process.env.NEXT_PUBLIC_DOCS_DOMAIN,
        req.cookies.get("_fern_docs_preview")?.value,
        // req.headers.get("x-forwarded-host"),
        req.headers.get("x-fern-host"),
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

export function getXFernHostNode(req: NextApiRequest, useSearchParams = false): string {
    const hosts = [
        useSearchParams ? req.query["host"] : undefined,
        process.env.NEXT_PUBLIC_DOCS_DOMAIN,
        req.cookies["_fern_docs_preview"],
        // req.headers["x-forwarded-host"],
        req.headers["x-fern-host"],
        req.headers.host,
    ];

    for (let host of hosts) {
        if (Array.isArray(host)) {
            continue;
        }

        host = cleanHost(host);
        if (host != null) {
            return host;
        }
    }

    throw new Error("Could not determine xFernHost from request.");
}

export function cleanHost(host: string | null | undefined): string | undefined {
    if (typeof host !== "string") {
        return undefined;
    }

    host = host.trim();

    // host should not be localhost
    if (host.includes("localhost")) {
        return undefined;
    }

    // host should not be an ip address
    if (host.match(/\d+\.\d+\.\d+\.\d+/)) {
        return undefined;
    }

    // strip `http://` or `https://` from the host, if present
    if (host.includes("://")) {
        host = host.split("://")[1];
    }

    // strip trailing slash from the host, if present
    if (host.endsWith("/")) {
        host = host.slice(0, -1);
    }

    if (host === "") {
        return undefined;
    }

    return host;
}
