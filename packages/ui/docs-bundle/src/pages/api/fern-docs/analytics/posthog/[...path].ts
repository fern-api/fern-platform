import { combineURLs, withDefaultProtocol } from "@fern-ui/core-utils";
import { NextResponse } from "next/server";

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

    const [, intendedPath = "/"] = req.url.split("/api/fern-docs/analytics/posthog");
    const targetUrl = new URL(combineURLs(validDestination, intendedPath.endsWith("/") ? intendedPath : intendedPath));
    if (!targetUrl.pathname.endsWith("/")) {
        targetUrl.pathname += "/";
    }
    return NextResponse.rewrite(targetUrl);
}

function getValidUrl(endpoint: string): string {
    return withDefaultProtocol(endpoint, "https://");
}
