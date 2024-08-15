import { withDefaultProtocol } from "@fern-ui/core-utils";

export const runtime = "edge";

/**
 * Proxies a PostHog client request to the given api_host
 *
 * @param req from a PostHog client
 * @returns response from the api_host
 */
export default async function handler(req: Request): Promise<Response> {
    const defaultPosthogInstance = "https://us.i.posthog.com";
    const destination = req.headers.get("x-fern-posthog-host") || defaultPosthogInstance;
    const validDestination = getValidUrl(destination);

    return passthroughTo(validDestination, req);
}

/**
 * Passes the given request to the destination + the path prefixed by /api/fern-docs/analytics/posthog
 *
 * @param destination
 * @param req
 * @returns Posthog's response
 */
function passthroughTo(destination: string, req: Request): Promise<Response> {
    const ourUrl = new URL(req.url);
    const requestPath = ourUrl.pathname.replace(/^\/api\/fern-docs\/analytics\/posthog/, "");

    const targetUrl = new URL(destination);
    targetUrl.pathname = requestPath;

    return fetch(targetUrl.toString(), {
        // we don't pass headers because we need fetch to figure out the correct content-encoding
        // the one that come in causes an error
        method: req.method,
        body: req.body,
        signal: req.signal,
    });
}

function getValidUrl(endpoint: string): string {
    return withDefaultProtocol(endpoint, "https://");
}
