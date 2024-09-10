import { withDefaultProtocol } from "@fern-ui/core-utils";
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_POSTHOG_INSTANCE = "https://us.i.posthog.com";

export function rewritePosthog(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();

    const destination = new URL(
        withDefaultProtocol(request.headers.get("x-fern-posthog-host") ?? DEFAULT_POSTHOG_INSTANCE),
    );

    const [, intendedPathname = "/"] = request.nextUrl.pathname.split("/api/fern-docs/analytics/posthog");

    const hostname =
        intendedPathname.startsWith("/static/") && destination.hostname.endsWith(".i.posthog.com")
            ? destination.hostname.replace(".i.posthog.com", "-assets.i.posthog.com") // i.e. us.i.posthog.com -> us-assets.i.posthog.com
            : destination.hostname;

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("host", hostname);

    url.pathname = intendedPathname;
    url.protocol = "https";
    url.hostname = hostname;
    url.port = 443;

    return NextResponse.rewrite(url, {
        headers: requestHeaders,
    });
}
