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

export function getXFernHostEdge(req: NextRequest): string {
    return req.headers.get("x-fern-host") ?? req.nextUrl.host;
}

export function getXFernHostNode(req: NextApiRequest): string {
    if (req.headers["x-fern-host"] != null) {
        const xFernHost = req.headers["x-fern-host"];
        if (typeof xFernHost === "string") {
            return xFernHost;
        } else if (xFernHost.length > 0) {
            return xFernHost[0];
        }
    }

    if (req.headers.host != null) {
        return req.headers.host;
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
