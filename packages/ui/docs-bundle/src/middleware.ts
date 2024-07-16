import { get } from "@vercel/edge-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import urlJoin from "url-join";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const requestHeaders = new Headers(request.headers);

    const host =
        requestHeaders.get("x-fern-host") ??
        process.env.NEXT_PUBLIC_DOCS_DOMAIN ??
        (process.env.VERCEL_ENV !== "production" ? request.cookies.get("_fern_docs_preview")?.value : undefined) ??
        (await getCanonicalHost(request)) ??
        request.nextUrl.host;
    requestHeaders.set("x-fern-host", host);

    /**
     * Check if the request is dynamic by checking if the request has a token cookie, or if the request is an error page.
     */
    const isDynamic =
        // true ||
        request.cookies.has("fern_token") ||
        (process.env.VERCEL_ENV !== "production" && request.cookies.has("_fern_docs_preview")) ||
        request.nextUrl.searchParams.get("error") === "true";

    if (isDynamic) {
        requestHeaders.set("x-fern-dynamic", "1");
    }

    const isPrefetch = request.headers.get("x-middleware-prefetch") === "1";

    if (request.nextUrl.pathname.includes("/_next/data/")) {
        if (isPrefetch) {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        const url = request.nextUrl.clone();
        url.pathname = urlJoin(
            isDynamic ? "dynamic" : "static",
            host,
            url.pathname
                .substring(url.pathname.indexOf("/_next/data/") + 12, url.pathname.indexOf(".json"))
                .split("/")
                .slice(1)
                .join("/"),
        );
        url.searchParams.set("__nextDataReq", "1");
        return NextResponse.rewrite(url, { headers: requestHeaders });
    }

    if (!request.nextUrl.pathname.includes("/_next/")) {
        const url = request.nextUrl.clone();
        url.pathname = urlJoin("/", isDynamic ? "dynamic" : "static", host, url.pathname.substring(1));
        if (isPrefetch) {
            url.searchParams.set("__nextDataReq", "1");
        }
        return NextResponse.rewrite(url, { headers: requestHeaders });
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

async function getCanonicalHost(request: NextRequest): Promise<string | undefined> {
    const canonicalUrls = await get<Record<string, string>>("cannonical-host");
    return canonicalUrls?.[request.nextUrl.host];
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
