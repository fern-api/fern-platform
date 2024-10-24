import { HEADER_X_MATCHED_PATH } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";
import { extractBuildId } from "./extractNextDataPathname";
import { getNextDataPageRoute, getPageRoute } from "./pageRoutes";
import { withPathname } from "./withPathname";
import { getDocsDomainEdge } from "./xfernhost/edge";

export function withMiddlewareRewrite(request: NextRequest, pathname: string): (isLoggedIn: boolean) => NextResponse {
    const xFernHost = getDocsDomainEdge(request);

    /**
     * error=true is a hack to force dynamic rendering when `_error.ts` is rendered.
     *
     * This is because: sometimes SSR'd markdown content throws an error during rendering,
     * and we want to show a partially errored page to the user.
     */
    const hasError = request.nextUrl.searchParams.get("error") === "true";

    return (isLoggedIn) => {
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

            let response = NextResponse.rewrite(withPathname(request, pathname), { request: { headers } });

            if (pathname === request.nextUrl.pathname) {
                response = NextResponse.next({ request: { headers } });
            }

            /**
             * Add x-matched-path header so the client can detect original path (despite a forward-proxy nextjs middleware rewriting to it)
             */
            response.headers.set(
                HEADER_X_MATCHED_PATH,
                getNextDataPageRoute(!isDynamic, buildId, xFernHost, rewrittenPathname),
            );

            return response;
        }

        /**
         * Rewrite all other requests to /static/[domain]/[[...slug]] or /dynamic/[domain]/[[...slug]]
         */

        pathname = getPageRoute(!isDynamic, xFernHost, pathname);
        return NextResponse.rewrite(withPathname(request, pathname));
    };
}

function getBuildId(req: NextRequest): string {
    return (
        req.nextUrl.buildId ??
        extractBuildId(req.nextUrl.pathname) ??
        (process.env.NODE_ENV === "development" ? "development" : "")
    );
}
