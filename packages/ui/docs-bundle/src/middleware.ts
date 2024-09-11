// eslint-disable-next-line import/no-internal-modules
import { FernUser, getAuthEdgeConfig, verifyFernJWTConfig } from "@fern-ui/ui/auth";
import { NextRequest, NextResponse, type MiddlewareConfig, type NextMiddleware } from "next/server";
import urlJoin from "url-join";
import { extractBuildId, extractNextDataPathname } from "./utils/extractNextDataPathname";
import { getPageRoute, getPageRouteMatch, getPageRoutePath } from "./utils/pageRoutes";
import { getXFernHostEdge } from "./utils/xFernHost";

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;
const CHANGELOG_PATTERN = /\.(rss|atom)$/;

export const middleware: NextMiddleware = async (request) => {
    const xFernHost = getXFernHostEdge(request);
    const nextUrl = request.nextUrl.clone();
    const headers = new Headers(request.headers);

    /**
     * Add x-fern-host header to the request
     */
    if (!headers.has("x-fern-host")) {
        headers.set("x-fern-host", xFernHost);
    }

    /**
     * Rewrite robots.txt
     */
    if (nextUrl.pathname.endsWith("/robots.txt")) {
        nextUrl.pathname = "/api/fern-docs/robots.txt";
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    /**
     * Rewrite sitemap.xml
     */
    if (nextUrl.pathname.endsWith("/sitemap.xml")) {
        nextUrl.pathname = "/api/fern-docs/sitemap.xml";
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    /**
     * Rewrite Posthog analytics ingestion
     */
    if (nextUrl.pathname.includes("/api/fern-docs/analytics/posthog")) {
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    /**
     * Rewrite API routes to /api/fern-docs
     */
    if (nextUrl.pathname.match(API_FERN_DOCS_PATTERN)) {
        nextUrl.pathname = request.nextUrl.pathname.replace(API_FERN_DOCS_PATTERN, "/api/fern-docs/");
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    /**
     * Rewrite changelog rss and atom feeds
     */
    const changelogFormat = request.nextUrl.pathname.match(CHANGELOG_PATTERN)?.[1];
    if (changelogFormat != null) {
        const pathname = request.nextUrl.pathname.replace(new RegExp(`.${changelogFormat}$`), "");
        nextUrl.pathname = "/api/fern-docs/changelog";
        nextUrl.searchParams.set("format", changelogFormat);
        nextUrl.searchParams.set("path", pathname);
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    // eslint-disable-next-line no-console
    // console.log(request);

    const pathname = extractNextDataPathname(request.nextUrl.pathname);

    // /**
    //  * Redirect to the trailing slash version of the URL if it's missing
    //  */
    // const conformedPathname = conformTrailingSlash(pathname);
    // if (pathname !== conformedPathname) {
    //     nextUrl.pathname = conformedPathname;
    //     nextUrl.host = request.headers.get("x-fern-host") ?? nextUrl.host;
    //     return NextResponse.redirect(nextUrl, { status: 308 });
    // }

    const fernToken = request.cookies.get("fern_token");
    const authConfig = await getAuthEdgeConfig(xFernHost);
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
        const destination = new URL(authConfig.redirect);
        destination.searchParams.set("state", urlJoin(`https://${xFernHost}`, pathname));
        return NextResponse.redirect(destination, { status: 302 });
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
     * Rewrite all other requests to /static/[host]/[[...slug]] or /dynamic/[host]/[[...slug]]
     */

    nextUrl.pathname = getPageRoute(!isDynamic, xFernHost, pathname);

    /**
     * Mock the /_next/data/... request to the corresponding page route
     */
    if (request.nextUrl.pathname.includes("/_next/data/")) {
        const buildId = getBuildId(request);
        nextUrl.pathname = getPageRoutePath(!isDynamic, buildId, xFernHost, pathname);

        const response = NextResponse.rewrite(nextUrl, {
            request: { headers },
        });

        response.headers.set("x-matched-path", getPageRouteMatch(!isDynamic, buildId));

        return response;
    }

    /**
     * Rewrite all other requests to /static/[host]/[[...slug]] or /dynamic/[host]/[[...slug]]
     */
    return NextResponse.rewrite(nextUrl, { request: { headers } });
};

export const config: MiddlewareConfig = {
    matcher: [
        /**
         * Match all requests to posthog
         */
        "/api/fern-docs/analytics/posthog/:path*",
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/fern-docs|_next/static|_next/image|favicon.ico).*)",
    ],
};

function getBuildId(req: NextRequest): string {
    return (
        req.nextUrl.buildId ??
        extractBuildId(req.nextUrl.pathname) ??
        (process.env.NODE_ENV === "development" ? "development" : "")
    );
}
