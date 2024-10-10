import { COOKIE_FERN_DOCS_PREVIEW, HEADER_X_FERN_HOST } from "@fern-ui/fern-docs-utils";
import type { NextApiRequest } from "next";
import { getNextPublicDocsDomain } from "./dev";
import { cleanHost } from "./util";

/**
 * Note: x-fern-host is always appended to the request header by cloudfront for all *.docs.buildwithfern.com requests.
 */
export function getXFernHostNode(req: NextApiRequest, useSearchParams = false): string {
    const hosts = [
        useSearchParams ? req.query["host"] : undefined,
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

    throw new Error("Could not determine xFernHost from request.");
}
