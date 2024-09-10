import { NextResponse, type NextRequest } from "next/server";
import urlJoin from "url-join";
import { rewritePosthog } from "./utils/rewritePosthog";
import { getXFernHostEdge } from "./utils/xFernHost";

// const NEXT_REWRITE_PATTERN = /^(?!\/_next\/).*(\/_next\/)/;

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;

export function middleware(request: NextRequest): NextResponse {
    const xFernHost = getXFernHostEdge(request);

    if (request.nextUrl.pathname.startsWith("/_next/static/") || request.nextUrl.pathname === "/favicon.ico") {
        return NextResponse.next();
    }

    // if (request.nextUrl.pathname.match(NEXT_REWRITE_PATTERN)) {
    //     const pathname = request.nextUrl.pathname.replace(NEXT_REWRITE_PATTERN, "/_next/");
    //     return NextResponse.rewrite(new URL(pathname, request.url));
    // }

    if (request.nextUrl.pathname.endsWith("/robots.txt")) {
        return NextResponse.rewrite(new URL("/api/fern-docs/robots.txt", request.url));
    }

    if (request.nextUrl.pathname.endsWith("/sitemap.xml")) {
        return NextResponse.rewrite(new URL("/api/fern-docs/sitemap.xml", request.url));
    }

    if (request.nextUrl.pathname.endsWith(".rss")) {
        const pathname = request.nextUrl.pathname.replace(".rss", "");
        return NextResponse.rewrite(
            new URL(`/api/fern-docs/changelog?format=rss&path=${encodeURIComponent(pathname)}`, request.url),
        );
    }

    if (request.nextUrl.pathname.endsWith(".atom")) {
        const pathname = request.nextUrl.pathname.replace(".atom", "");
        return NextResponse.rewrite(
            new URL(`/api/fern-docs/changelog?format=atom&path=${encodeURIComponent(pathname)}`, request.url),
        );
    }

    if (request.nextUrl.pathname.includes("/api/fern-docs/analytics/posthog")) {
        return rewritePosthog(request);
    }

    if (request.nextUrl.pathname.match(API_FERN_DOCS_PATTERN)) {
        const pathname = request.nextUrl.pathname.replace(API_FERN_DOCS_PATTERN, "/api/fern-docs/");
        return NextResponse.rewrite(new URL(pathname, request.url));
    }

    if (request.nextUrl.pathname.includes("/_next/data/")) {
        const match = request.nextUrl.pathname.match(/\/_next\/data\/([^/]*)(\/.*).json/);
        const buildId = match?.[1];
        const pathname = match?.[2];
        if (buildId != null && pathname != null) {
            const nextDataPathname = urlJoin("/static/", xFernHost, pathname);
            const destination = new URL(nextDataPathname, request.url);
            // destination.search = request.nextUrl.search;
            destination.searchParams.set("__nextDataReq", "1");
            return NextResponse.rewrite(destination);
        }
    }
    const pathname = urlJoin("/static/", xFernHost, request.nextUrl.pathname);

    return NextResponse.rewrite(new URL(pathname, request.url));
}

export const config = {
    matcher: [
        "/api/fern-docs/analytics/posthog/:path*",
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        {
            source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
            missing: [
                { type: "header", key: "next-router-prefetch" },
                { type: "header", key: "purpose", value: "prefetch" },
            ],
        },
    ],
};
