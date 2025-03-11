import {
  type MiddlewareConfig,
  type NextMiddleware,
  NextResponse,
} from "next/server";

import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import {
  COOKIE_FERN_TOKEN,
  HEADER_X_FERN_BASEPATH,
  HEADER_X_FERN_HOST,
  HEADER_X_FORWARDED_HOST,
  conformTrailingSlash,
  removeLeadingSlash,
  removeTrailingSlash,
} from "@fern-docs/utils";

import { rewritePosthog } from "@/server/analytics/rewritePosthog";
import { MARKDOWN_PATTERN, RSS_PATTERN } from "@/server/patterns";
import { withPathname } from "@/server/withPathname";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

import { createGetAuthStateEdge } from "./server/auth/getAuthStateEdge";
import { preferPreview } from "./server/auth/origin";
import { withSecureCookie } from "./server/auth/with-secure-cookie";

function splitPathname(
  pathname: string,
  splitter: string | RegExp
): [basepath: string, pathname: string] {
  const index =
    typeof splitter === "string"
      ? pathname.indexOf(splitter)
      : pathname.search(splitter);
  if (index <= 0) {
    return ["/", pathname];
  }
  return [pathname.slice(0, index), pathname.slice(index)];
}

export const middleware: NextMiddleware = async (request) => {
  const host = request.nextUrl.host;
  const domain = getDocsDomainEdge(request);
  const pathname = removeTrailingSlash(request.nextUrl.pathname);

  const headers = new Headers(request.headers);
  headers.set(HEADER_X_FERN_HOST, domain);
  headers.set(HEADER_X_FORWARDED_HOST, domain);

  const rewrite = (
    newPathname: string,
    search?: string | URLSearchParams | Record<string, string> | string[][]
  ) => {
    if (pathname === newPathname && !search) {
      return NextResponse.next({ request: { headers } });
    }
    const destination = withPathname(
      request,
      conformTrailingSlash(newPathname),
      search
    );

    console.log(
      "[middleware] rewrote",
      request.nextUrl.pathname,
      "to",
      destination
    );

    return NextResponse.rewrite(destination, {
      request: { headers },
    });
  };

  // this mutation is reversed in `useCurrentPathname` hook. if this changes, please update that hook.
  const withDomain = (pathname: string) => `/${host}/${domain}${pathname}`;

  const withoutBasepath = (splitter: string | RegExp) => {
    const [basepath, newPathname] = splitPathname(pathname, splitter);
    headers.set(HEADER_X_FERN_BASEPATH, basepath);
    return newPathname;
  };

  const withoutEnding = (splitter: string | RegExp) => {
    const [newPathname] = splitPathname(pathname, splitter);
    return newPathname;
  };

  /**
   * Rewrite /api/fern-docs/revalidate-all/v3 to /api/fern-docs/revalidate?regenerate=true
   */
  if (pathname.endsWith("/api/fern-docs/revalidate-all/v3")) {
    return rewrite(withDomain("/api/fern-docs/revalidate"));
  }

  /**
   * Rewrite robots.txt
   */
  if (pathname.endsWith("/robots.txt")) {
    return rewrite(withoutBasepath("/robots.txt"));
  }

  /**
   * Rewrite sitemap.xml
   */
  if (pathname.endsWith("/sitemap.xml")) {
    return rewrite(withoutBasepath("/sitemap.xml"));
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
  if (pathname.includes("/api/fern-docs/")) {
    return rewrite(withDomain(withoutBasepath("/api/fern-docs/")));
  }

  /**
   * Rewrite llms.txt
   */
  if (pathname.endsWith("/llms.txt")) {
    const slug = removeLeadingSlash(withoutEnding(/\/llms\.txt$/));
    return rewrite(withDomain("/api/fern-docs/llms.txt"), { slug });
  }

  /**
   * Rewrite llms-full.txt
   */
  if (pathname.endsWith("/llms-full.txt")) {
    const slug = removeLeadingSlash(withoutEnding(/\/llms-full\.txt$/));
    return rewrite(withDomain("/api/fern-docs/llms-full.txt"), { slug });
  }

  /**
   * Rewrite markdown
   */
  if (pathname.match(MARKDOWN_PATTERN)) {
    const slug = removeLeadingSlash(withoutEnding(MARKDOWN_PATTERN));
    return rewrite(withDomain("/api/fern-docs/markdown"), { slug });
  }

  /**
   * Rewrite changelog rss and atom feeds
   */
  if (pathname.match(RSS_PATTERN)) {
    const format = pathname.match(RSS_PATTERN)?.[1] ?? "rss";
    const slug = removeLeadingSlash(withoutEnding(RSS_PATTERN));
    return rewrite(withDomain("/api/fern-docs/changelog"), { format, slug });
  }

  /**
   * Rewrite .../~explorer to /[domain]/explorer/...
   */
  if (pathname.endsWith("/~explorer")) {
    const pathname = withoutEnding("/~explorer");
    return rewrite(withDomain(`/explorer/${encodeURIComponent(pathname)}`));
  }

  let newToken: string | undefined;

  const { getAuthState } = await createGetAuthStateEdge(request, (token) => {
    newToken = token;
  });
  const authState = await getAuthState(pathname);

  const getResponse = () => {
    if (authState.authed) {
      return rewrite(withDomain(`/dynamic/${encodeURIComponent(pathname)}`));
    }
    if (!authState.ok && authState.authorizationUrl) {
      return NextResponse.redirect(authState.authorizationUrl);
    }

    return rewrite(withDomain(`/static/${encodeURIComponent(pathname)}`));
  };

  const response = getResponse();
  if (newToken) {
    response.cookies.set(
      COOKIE_FERN_TOKEN,
      newToken,
      withSecureCookie(withDefaultProtocol(preferPreview(host, domain)))
    );
  }
  return response;
};

export const config: MiddlewareConfig = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/fern-docs (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!.well-known|_next|_vercel|favicon.ico|manifest.webmanifest).*)",
  ],
};
