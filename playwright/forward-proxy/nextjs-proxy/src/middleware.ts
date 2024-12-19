import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    if (request.nextUrl.pathname === "/subpath/test-capture-the-flag") {
        return NextResponse.redirect(
            new URL("/subpath/capture-the-flag", request.url)
        );
    }

    const headers = new Headers(request.headers);
    headers.set("x-fern-host", "test-nginx-proxy.docs.buildwithfern.com");

    return NextResponse.rewrite(
        `${process.env.DEPLOYMENT_URL}${request.nextUrl.pathname}${request.nextUrl.search}`,
        {
            request: { headers },
        }
    );
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: [
        "/subpath",
        "/subpath/:path*",
        // this only applies to preview deployments where the asset cdn is not set:
        "/_next/static/:path*",
    ],
};
