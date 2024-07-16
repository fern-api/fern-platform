import { get } from "@vercel/edge-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    // Clone the request headers and set a new header `x-hello-from-middleware1`
    const requestHeaders = new Headers(request.headers);
    if (requestHeaders.has("x-fern-host")) {
        return NextResponse.next();
    }

    const canonicalHost = await getCanonicalHost(request);
    if (canonicalHost) {
        requestHeaders.set("x-fern-host", canonicalHost);
        // You can also set request headers in NextResponse.rewrite
        return NextResponse.next({
            request: {
                // New request headers
                headers: requestHeaders,
            },
        });
    }

    return NextResponse.next();
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

async function getCanonicalHost(request: NextRequest): Promise<string | undefined> {
    const canonicalUrls = await get<Record<string, string>>("cannonical-host");
    return canonicalUrls?.[request.nextUrl.host];
}
