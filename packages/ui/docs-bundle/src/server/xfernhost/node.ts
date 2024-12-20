import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
import type { IncomingHttpHeaders } from "http";
import type { NextApiRequest } from "next";
import { getNextPublicDocsDomain } from "./dev";
import { cleanHost } from "./util";

/**
 * Note: x-fern-host is always appended to the request header by cloudfront for all *.docs.buildwithfern.com requests.
 */
export function getDocsDomainNode(req: NextApiRequest): string {
    const hosts = [
        getNextPublicDocsDomain(),
        req.cookies[COOKIE_FERN_DOCS_PREVIEW],
        req.headers[HEADER_X_FERN_HOST],
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

    // eslint-disable-next-line no-console
    console.error("Could not determine xFernHost from request. Returning buildwithfern.com.");
    return "buildwithfern.com";
}

// attempts to construct the host from environment variables, when the req object is not available
export function getHostNodeStatic(): string | undefined {
    if (process.env.NODE_ENV === "development") {
        return `${process.env.HOST || "localhost"}:${process.env.PORT || 3000}`;
    }

    if (process.env.VERCEL_ENV === "preview" || process.env.VERCEL_ENV === "development") {
        return process.env.VERCEL_URL;
    }

    return undefined;
}

function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }

    try {
        return new URL(url, withDefaultProtocol(getHostNodeStatic())).host;
    } catch (_e) {
        return undefined;
    }
}

export function getHostNode(req: { url?: string; headers?: IncomingHttpHeaders }): string | undefined {
    const host = req.headers?.host;

    const xFernHostHeader = req.headers?.[HEADER_X_FERN_HOST];
    const xFernHost = typeof xFernHostHeader === "string" ? xFernHostHeader : undefined;

    return xFernHost ?? host ?? getHostFromUrl(req.url) ?? getHostNodeStatic();
}
