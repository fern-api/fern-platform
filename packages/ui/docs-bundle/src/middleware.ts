import { NextRequest, NextResponse, userAgent } from "next/server";
import urlJoin from "url-join";

const discriminants = ["static", "mobile", "dynamic"];

export function middleware(request: NextRequest): NextResponse {
    const url = request.nextUrl.clone();

    const ua = userAgent(request);
    const hasToken = request.cookies.has("fern_token");
    const hasError = request.nextUrl.searchParams.get("error") === "true";
    const shouldBeDynamic = hasToken || hasError;

    const host =
        process.env.NEXT_PUBLIC_DOCS_DOMAIN ??
        request.cookies.get("_fern_docs_preview")?.value ??
        request.headers.get("x-fern-host") ??
        request.nextUrl.hostname;

    if (url.pathname.endsWith(".rss") || url.pathname.endsWith(".atom")) {
        url.searchParams.set("format", url.pathname.endsWith(".rss") ? "rss" : "atom");
        url.searchParams.set("path", url.pathname.replace(/\.rss|\.atom$/, ""));
        url.pathname = "/api/fern-docs/changelog";
        return NextResponse.rewrite(url);
    }

    if (url.pathname.startsWith("/_next/data")) {
        // example: /_next/data/:hash/:discriminant/:oldhost/:path*
        const [, , , hash, discriminant, oldhost, ...path] = url.pathname.split("/");
        if (!discriminants.includes(discriminant)) {
            return NextResponse.rewrite(
                urlJoin("/_next/data", hash, shouldBeDynamic ? "dynamic" : "static", host, oldhost, ...path),
            );
        } else if (shouldBeDynamic && discriminant !== "dynamic") {
            return NextResponse.rewrite(urlJoin("/_next/data", hash, "dynamic", host, ...path));
        } else if (oldhost !== host) {
            return NextResponse.rewrite(urlJoin("/_next/data", hash, discriminant, host, ...path));
        } else {
            return NextResponse.next();
        }
    }

    if (discriminants.some((d) => url.pathname.startsWith(urlJoin(`/${d}`, host)))) {
        return NextResponse.next();
    }

    if (shouldBeDynamic) {
        url.pathname = urlJoin("/dynamic", host, url.pathname);
        return NextResponse.rewrite(url);
    }

    if (ua.device.type === "mobile") {
        url.pathname = urlJoin("/mobile", host, url.pathname);
        return NextResponse.rewrite(url);
    }

    url.pathname = urlJoin("/static", host, url.pathname);
    return NextResponse.rewrite(url);
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
