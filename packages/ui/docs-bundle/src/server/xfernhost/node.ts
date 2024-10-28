import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
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

export function getHostNode(req: { url?: string }): string | undefined {
    if (req.url != null) {
        try {
            return new URL(req.url, withDefaultProtocol(getHostNodeStatic())).host;
        } catch (_e) {
            // do nothing
        }
    }

    return getHostNodeStatic();
}
