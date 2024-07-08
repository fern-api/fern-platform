import { NextRequest, NextResponse, userAgent } from "next/server";
import urlJoin from "url-join";

export function middleware(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();

    if (url.pathname.endsWith(".rss") || url.pathname.endsWith(".atom")) {
        url.searchParams.set("format", url.pathname.endsWith(".rss") ? "rss" : "atom");
        url.searchParams.set("path", url.pathname.replace(/\.rss|\.atom$/, ""));
        url.pathname = "/api/fern-docs/changelog";
        return NextResponse.rewrite(url);
    }

    if (
        url.pathname.startsWith(urlJoin("/dynamic", url.hostname)) ||
        url.pathname.startsWith(urlJoin("/static", url.hostname)) ||
        url.pathname.startsWith(urlJoin("/mobile", url.hostname))
    ) {
        return NextResponse.next();
    }

    const ua = userAgent(request);
    const hasToken = request.cookies.has("fern_token");
    const hasError = request.nextUrl.searchParams.get("error") === "true";

    if (!ua.isBot && (hasToken || hasError)) {
        url.pathname = urlJoin("/dynamic", url.hostname, url.pathname);
        return NextResponse.rewrite(url);
    }

    if (ua.device.type === "mobile") {
        url.pathname = urlJoin("/mobile", url.hostname, url.pathname);
        return NextResponse.rewrite(url);
    }

    url.pathname = urlJoin("/static", url.hostname, url.pathname);
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
