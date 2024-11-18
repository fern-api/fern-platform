import { rewritePosthog } from "@/server/analytics/rewritePosthog";
import { extractNextDataPathname } from "@/server/extractNextDataPathname";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import { NextResponse, type NextMiddleware } from "next/server";
import { withMiddlewareAuth } from "./server/withMiddlewareAuth";
import { withMiddlewareRewrite } from "./server/withMiddlewareRewrite";
import { withPathname } from "./server/withPathname";

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;
const CHANGELOG_PATTERN = /\.(rss|atom)$/;
const MARKDOWN_PATTERN = /\.(md|mdx)$/;

export const middleware: NextMiddleware = async (request) => {
    let pathname = extractNextDataPathname(removeTrailingSlash(request.nextUrl.pathname));

    /**
     * Correctly handle 404 and 500 pages
     * so that nextjs doesn't incorrectly match this request to __next_data_catchall
     */
    if (pathname === "/404" || pathname === "/500" || pathname === "/_error") {
        const headers = new Headers(request.headers);

        if (request.nextUrl.pathname.includes("/_next/data/") && pathname === "/404") {
            // This is a hack to mock the 404 data page, since nextjs isn't playing nice with our middleware
            return NextResponse.json({}, { status: 404 });
        }

        let response = NextResponse.rewrite(withPathname(request, pathname), { request: { headers } });

        if (pathname === request.nextUrl.pathname) {
            response = NextResponse.next({ request: { headers } });
        }

        response.headers.set("x-matched-path", pathname);
        return response;
    }

    /**
     * Rewrite robots.txt
     */
    if (pathname.endsWith("/robots.txt")) {
        pathname = "/api/fern-docs/robots.txt";
        return NextResponse.rewrite(withPathname(request, pathname));
    }

    /**
     * Rewrite sitemap.xml
     */
    if (pathname.endsWith("/sitemap.xml")) {
        pathname = "/api/fern-docs/sitemap.xml";
        return NextResponse.rewrite(withPathname(request, pathname));
    }

    /**
     * Rewrite Posthog analytics ingestion
     */
    if (pathname.includes("/api/fern-docs/analytics/posthog")) {
        return rewritePosthog(request);
    }

    /**
     * Rewrite API routes to /api/fern-docs
     */
    if (pathname.match(API_FERN_DOCS_PATTERN)) {
        pathname = request.nextUrl.pathname.replace(API_FERN_DOCS_PATTERN, "/api/fern-docs/");
        return NextResponse.rewrite(withPathname(request, pathname));
    }

    /**
     * Rewrite changelog rss and atom feeds
     */
    const changelogFormat = pathname.match(CHANGELOG_PATTERN)?.[1];
    if (changelogFormat != null) {
        pathname = pathname.replace(new RegExp(`.${changelogFormat}$`), "");
        if (pathname === "/index") {
            pathname = "/";
        }
        const url = new URL("/api/fern-docs/changelog", request.nextUrl.origin);
        url.searchParams.set("format", changelogFormat);
        url.searchParams.set("path", pathname);
        return NextResponse.rewrite(String(url));
    }

    const markdownExtension = pathname.match(MARKDOWN_PATTERN)?.[1];
    if (markdownExtension != null) {
        pathname = pathname.replace(new RegExp(`.${markdownExtension}$`), "");
        if (pathname === "/index") {
            pathname = "/";
        }
        const url = new URL("/api/fern-docs/markdown", request.nextUrl.origin);
        url.searchParams.set("format", markdownExtension);
        url.searchParams.set("path", pathname);
        return NextResponse.rewrite(String(url));
    }

    return withMiddlewareAuth(request, pathname, withMiddlewareRewrite(request, pathname));
};

export const config = {
    matcher: [
        /**
         * Match all requests to posthog
         */
        "/api/fern-docs/analytics/posthog/:path*",
        "/:prefix*/api/fern-docs/analytics/posthog/:path*",
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/fern-docs|_next/static|_next/image|_vercel|favicon.ico).*)",
    ],
};
