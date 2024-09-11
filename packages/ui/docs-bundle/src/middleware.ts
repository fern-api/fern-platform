// eslint-disable-next-line import/no-internal-modules
import { FernUser, getAuthEdgeConfig, verifyFernJWTConfig } from "@fern-ui/ui/auth";
import { NextResponse, type MiddlewareConfig, type NextRequest } from "next/server";
import urlJoin from "url-join";
import { extractNextDataPathname } from "./utils/extractNextDataPathname";
import { rewritePosthog } from "./utils/rewritePosthog";
import { getXFernHostEdge } from "./utils/xFernHost";

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;
const CHANGELOG_PATTERN = /\.(rss|atom)$/;

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const xFernHost = getXFernHostEdge(request);

    /**
     * Rewrite robots.txt
     */
    if (request.nextUrl.pathname.endsWith("/robots.txt")) {
        return NextResponse.rewrite(new URL("/api/fern-docs/robots.txt", request.url));
    }

    /**
     * Rewrite sitemap.xml
     */
    if (request.nextUrl.pathname.endsWith("/sitemap.xml")) {
        return NextResponse.rewrite(new URL("/api/fern-docs/sitemap.xml", request.url));
    }

    /**
     * Rewrite Posthog analytics ingestion
     */
    if (request.nextUrl.pathname.includes("/api/fern-docs/analytics/posthog")) {
        return rewritePosthog(request);
    }

    /**
     * Rewrite API routes to /api/fern-docs
     */
    if (request.nextUrl.pathname.match(API_FERN_DOCS_PATTERN)) {
        const pathname = request.nextUrl.pathname.replace(API_FERN_DOCS_PATTERN, "/api/fern-docs/");
        return NextResponse.rewrite(new URL(pathname, request.url));
    }

    /**
     * Rewrite changelog rss and atom feeds
     */
    const changelogFormat = request.nextUrl.pathname.match(CHANGELOG_PATTERN)?.[1];
    if (changelogFormat != null) {
        const pathname = request.nextUrl.pathname.replace(new RegExp(`.${changelogFormat}$`), "");
        return NextResponse.rewrite(
            new URL(
                `/api/fern-docs/changelog?format=${changelogFormat}&path=${encodeURIComponent(pathname)}`,
                request.url,
            ),
        );
    }

    const pathname = extractNextDataPathname(request.nextUrl.pathname);

    const fernToken = request.cookies.get("fern_token");

    let user: FernUser | undefined = undefined;

    const authConfig = await getAuthEdgeConfig(xFernHost);

    // TODO: check if the site is SSO protected, and if so, redirect to the SSO provider
    if (fernToken != null) {
        try {
            user = await verifyFernJWTConfig(fernToken.value, authConfig);
        } catch (e) {
            // eslint-disable-next-line no-console
            console.error("Failed to verify fern_token", e);
        }
    }

    // using custom auth (e.g. qlty, propexo, etc)
    if (authConfig != null && authConfig.type === "basic_token_verification" && user == null) {
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
    const isDynamic = user != null || hasError;
    const prefix = isDynamic ? "/dynamic/" : "/static/";

    /**
     * Rewrite all other requests to /static/[host]/[[...slug]] or /dynamic/[host]/[[...slug]]
     */
    const destination = new URL(urlJoin(prefix, xFernHost, pathname), request.url);

    /**
     * Add __nextDataReq=1 query param to the destination URL if the request is for a nextjs data request
     */
    if (request.nextUrl.pathname.includes("/_next/data/")) {
        destination.searchParams.set("__nextDataReq", "1");
    }

    return NextResponse.rewrite(destination);
}

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
