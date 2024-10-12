import { extractBuildId, extractNextDataPathname } from "@/server/extractNextDataPathname";
import { getPageRoute, getPageRouteMatch, getPageRoutePath } from "@/server/pageRoutes";
import { rewritePosthog } from "@/server/rewritePosthog";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import type { FernUser } from "@fern-ui/fern-docs-auth";
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
    const nextUrl = request.nextUrl.clone();
    const headers = new Headers(request.headers);

    /**
     * Do not rewrite 404 and 500 pages
     */
    if (
        removeTrailingSlash(request.nextUrl.pathname) === "/404" ||
        removeTrailingSlash(request.nextUrl.pathname) === "/500"
    ) {
        return NextResponse.next();
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
        return rewritePosthog(request);
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

    const pathname = extractNextDataPathname(request.nextUrl.pathname);

    /**
     * attempt to rewrite /404 and /_error data routes to the correct destination,
     * otherwise nextjs will match to `__next_data_catchall`.
     *
     * this is important for `hardNavigate404` to work, because it relies on knowing that the destination is /404.json
     */
    if ((pathname === "/404" || pathname === "/_error") && request.nextUrl.pathname.includes("/_next/data/")) {
        const buildId = getBuildId(request);
        nextUrl.pathname = `/_next/data/${buildId}${pathname}.json`;
        if (nextUrl.pathname === request.nextUrl.pathname) {
            return NextResponse.next({ request: { headers } });
        }
        return NextResponse.rewrite(nextUrl, { request: { headers } });
    }

    const fernToken = request.cookies.get(COOKIE_FERN_TOKEN);
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

        nextUrl.pathname = getPageRoutePath(!isDynamic, buildId, xFernHost, pathname);

        const response = NextResponse.rewrite(nextUrl, { request: { headers } });

        /**
         * Add x-matched-path header to the response to help with debugging
         */
        response.headers.set("x-matched-path", getPageRouteMatch(!isDynamic, buildId));

        return response;
    }

    /**
     * Rewrite all other requests to /static/[domain]/[[...slug]] or /dynamic/[domain]/[[...slug]]
     */

    nextUrl.pathname = getPageRoute(!isDynamic, xFernHost, pathname);
    return NextResponse.rewrite(nextUrl, { request: { headers } });
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
