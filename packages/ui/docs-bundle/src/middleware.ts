import { extractBuildId, extractNextDataPathname } from "@/server/extractNextDataPathname";
import { getNextDataPageRoute, getPageRoute } from "@/server/pageRoutes";
import { rewritePosthog } from "@/server/rewritePosthog";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import type { AuthEdgeConfig, FernUser } from "@fern-ui/fern-docs-auth";
import { getAuthEdgeConfig } from "@fern-ui/fern-docs-edge-config";
import { COOKIE_FERN_TOKEN } from "@fern-ui/fern-docs-utils";
import { removeTrailingSlash } from "next/dist/shared/lib/router/utils/remove-trailing-slash";
import { NextRequest, NextResponse, type NextMiddleware } from "next/server";
import urlJoin from "url-join";
import { verifyFernJWTConfig } from "./server/auth/FernJWT";
import { withBasicTokenAnonymous } from "./server/withBasicTokenAnonymous";

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;
const CHANGELOG_PATTERN = /\.(rss|atom)$/;

export const middleware: NextMiddleware = async (request) => {
    const xFernHost = getDocsDomainEdge(request);
    const search = request.nextUrl.search;

    const withPathname = (pathname: string): string => {
        return `${request.nextUrl.origin}${pathname}${search}`;
    };

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

        let response = NextResponse.rewrite(withPathname(pathname), { request: { headers } });

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
        return NextResponse.rewrite(withPathname(pathname));
    }

    /**
     * Rewrite sitemap.xml
     */
    if (pathname.endsWith("/sitemap.xml")) {
        pathname = "/api/fern-docs/sitemap.xml";
        return NextResponse.rewrite(withPathname(pathname));
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
        return NextResponse.rewrite(withPathname(pathname));
    }

    /**
     * Rewrite changelog rss and atom feeds
     */
    const changelogFormat = pathname.match(CHANGELOG_PATTERN)?.[1];
    if (changelogFormat != null) {
        pathname = pathname.replace(new RegExp(`.${changelogFormat}$`), "");
        const url = new URL("/api/fern-docs/changelog", request.nextUrl.origin);
        url.searchParams.set("format", changelogFormat);
        url.searchParams.set("path", pathname);
        return NextResponse.rewrite(String(url));
    }

    const fernToken = request.cookies.get(COOKIE_FERN_TOKEN);
    let authConfig: AuthEdgeConfig | undefined;

    try {
        authConfig = await getAuthEdgeConfig(xFernHost);
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error("Failed to get auth config", e);
    }

    let fernUser: FernUser | undefined;

    // TODO: check if the site is SSO protected, and if so, redirect to the SSO provider
    if (fernToken != null) {
        try {
            fernUser = await verifyFernJWTConfig(fernToken?.value, authConfig);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to verify fern_token", e);
        }
    }

    const isLoggedIn = fernUser != null;

    /**
     * if using custom auth (e.g. qlty, propexo, etc), and the user is not authenticated,
     * redirect to the custom auth provider
     */
    if (!isLoggedIn && authConfig?.type === "basic_token_verification") {
        if (withBasicTokenAnonymous(authConfig, pathname)) {
            const destination = new URL(authConfig.redirect);
            destination.searchParams.set("state", urlJoin(withDefaultProtocol(xFernHost), pathname));
            // TODO: validate allowlist of domains to prevent open redirects
            return NextResponse.redirect(destination);
        }
    }

    /**
     * error=true is a hack to force dynamic rendering when `_error.ts` is rendered.
     *
     * This is because: sometimes SSR'd markdown content throws an error during rendering,
     * and we want to show a partially errored page to the user.
     */
    const hasError = request.nextUrl.searchParams.get("error") === "true";

    /**
     * There are two types of pages in the docs bundle:
     * - static = SSG pages
     * - dynamic = SSR pages (because fern_token is present or there is an error)
     */
    const isDynamic = isLoggedIn || hasError;

    /**
     * Mock the /_next/data/... request to the corresponding page route
     */
    if (request.nextUrl.pathname.includes("/_next/data/")) {
        const buildId = getBuildId(request);

        const headers = new Headers(request.headers);
        headers.set("x-nextjs-data", "1");

        const rewrittenPathname = pathname;

        pathname = getPageRoute(!isDynamic, xFernHost, rewrittenPathname);

        // NOTE: skipMiddlewareUrlNormalize=true must be set for this to work
        // if the request is not in the /_next/data/... path, we need to rewrite to the full /_next/data/... path
        if (!request.nextUrl.pathname.startsWith("/_next/data/") && process.env.NODE_ENV === "development") {
            pathname = getNextDataPageRoute(!isDynamic, buildId, xFernHost, rewrittenPathname);
        }

        let response = NextResponse.rewrite(withPathname(pathname), { request: { headers } });

        if (pathname === request.nextUrl.pathname) {
            response = NextResponse.next({ request: { headers } });
        }

        /**
         * Add x-matched-path header so the client can detect original path (despite a forward-proxy nextjs middleware rewriting to it)
         */
        response.headers.set("x-matched-path", getNextDataPageRoute(!isDynamic, buildId, xFernHost, rewrittenPathname));

        return response;
    }

    /**
     * Rewrite all other requests to /static/[domain]/[[...slug]] or /dynamic/[domain]/[[...slug]]
     */

    pathname = getPageRoute(!isDynamic, xFernHost, pathname);
    return NextResponse.rewrite(withPathname(pathname));
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

function getBuildId(req: NextRequest): string {
    return (
        req.nextUrl.buildId ??
        extractBuildId(req.nextUrl.pathname) ??
        (process.env.NODE_ENV === "development" ? "development" : "")
    );
}
