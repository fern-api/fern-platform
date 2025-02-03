import { rewritePosthog } from "@/server/analytics/rewritePosthog";
import { extractNextDataPathname } from "@/server/extractNextDataPathname";
import { removeLeadingSlash, removeTrailingSlash } from "@fern-docs/utils";
import { NextResponse, type NextMiddleware } from "next/server";
import { MARKDOWN_PATTERN, RSS_PATTERN } from "./server/patterns";
import { withPathname } from "./server/withPathname";

const API_FERN_DOCS_PATTERN = /^(?!\/api\/fern-docs\/).*(\/api\/fern-docs\/)/;

export const middleware: NextMiddleware = async (request) => {
  console.log("middleware", request.nextUrl.pathname);
  const headers = new Headers(request.headers);

  let pathname = extractNextDataPathname(
    removeTrailingSlash(request.nextUrl.pathname)
  );

  headers.set("x-pathname", pathname);

  /**
   * Rewrite robots.txt
   */
  if (pathname.endsWith("/robots.txt")) {
    if (pathname === "/robots.txt") {
      return NextResponse.next();
    }

    headers.set("x-fern-basepath", pathname.replace(/\/robots\.txt$/, ""));

    return NextResponse.rewrite(withPathname(request, "/robots.txt"), {
      request: { headers },
    });
  }

  /**
   * Rewrite sitemap.xml
   */
  if (pathname.endsWith("/sitemap.xml")) {
    if (pathname === "/sitemap.xml") {
      return NextResponse.next();
    }

    return NextResponse.rewrite(withPathname(request, "/sitemap.xml"), {
      request: { headers },
    });
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
    pathname = request.nextUrl.pathname.replace(
      API_FERN_DOCS_PATTERN,
      "/api/fern-docs/"
    );
    return NextResponse.rewrite(withPathname(request, pathname));
  }

  /**
   * Rewrite llms.txt
   */
  if (pathname.endsWith("/llms.txt")) {
    return NextResponse.rewrite(
      withPathname(
        request,
        "/api/fern-docs/llms.txt",
        String(
          new URLSearchParams({
            slug: removeLeadingSlash(pathname).replace(/\/llms\.txt$/, ""),
          })
        )
      )
    );
  }

  /**
   * Rewrite llms-full.txt
   */
  if (pathname.endsWith("/llms-full.txt")) {
    return NextResponse.rewrite(
      withPathname(
        request,
        "/api/fern-docs/llms-full.txt",
        String(
          new URLSearchParams({
            slug: removeLeadingSlash(pathname).replace(/\/llms-full\.txt$/, ""),
          })
        )
      )
    );
  }

  /**
   * Rewrite markdown
   */
  if (pathname.match(MARKDOWN_PATTERN)) {
    return NextResponse.rewrite(
      withPathname(
        request,
        "/api/fern-docs/markdown",
        String(
          new URLSearchParams({
            slug: removeLeadingSlash(pathname).replace(MARKDOWN_PATTERN, ""),
          })
        )
      )
    );
  }

  /**
   * Rewrite changelog rss and atom feeds
   */
  if (pathname.match(RSS_PATTERN)) {
    const format = pathname.match(RSS_PATTERN)?.[1] ?? "rss";
    return NextResponse.rewrite(
      withPathname(
        request,
        "/api/fern-docs/changelog",
        String(
          new URLSearchParams({
            format,
            slug: removeLeadingSlash(pathname).replace(RSS_PATTERN, ""),
          })
        )
      )
    );
  }

  return NextResponse.next({ request: { headers } });
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
    "/((?!api/fern-docs|.well-known|_next/static|_next/image|_vercel|favicon.ico).*)",
  ],
};
