import { NextResponse, type NextRequest } from "next/server";

const POSTHOG_INGEST_HOST = "us.i.posthog.com";
const POSTHOG_ASSETS_HOST = "us-assets.i.posthog.com";

/**
 * adapted from https://posthog.com/docs/advanced/proxy/nextjs-middleware
 */
export function rewritePosthog(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();

    const [, intendedPathname = "/"] = request.nextUrl.pathname.split(
        "/api/fern-docs/analytics/posthog"
    );

    const hostname = intendedPathname.startsWith("/static/")
        ? POSTHOG_ASSETS_HOST
        : POSTHOG_INGEST_HOST;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("host", hostname);

    url.pathname = intendedPathname;
    url.protocol = "https";
    url.hostname = hostname;
    url.port = "443";

    return NextResponse.rewrite(url, {
        headers: requestHeaders,
    });
}
