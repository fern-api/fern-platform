import { rewrite } from "@vercel/edge";
import { NextFetchEvent, NextRequest } from "next/server";

export default function middleware(request: NextRequest, _context: NextFetchEvent): Response | void {
    const url = new URL(request.url);

    const fernToken = request.cookies.get("fern_token");
    const fernDocsPreviewHost = request.cookies.get("_fern_docs_preview")?.value;
    const host =
        fernDocsPreviewHost ??
        process.env.NEXT_PUBLIC_DOCS_DOMAIN ??
        request.headers.get("x-forwarded-host") ??
        request.headers.get("x-fern-host") ??
        request.headers.get("host") ??
        url.host;

    /**
     * while /_next/static routes are handled by the assetPrefix config, we need to handle the /_next/data routes separately
     * when the user is hovering over a link, Next.js will prefetch the data route using `/_next/data` routes. We intercept
     * the prefetch request at packages/ui/app/src/next-app/NextApp.tsx and append the customer-defined basepath:
     *
     * i.e. /base/path/_next/data/*
     *
     * This rewrite rule will ensure that /base/path/_next/data/* is rewritten to /_next/data/* on the server
     */
    if (url.pathname.includes("/_next/")) {
        const index = url.pathname.indexOf("/_next/");
        let newPath = url.pathname.slice(index);

        // for prefetch requests that are made to /static/, we need to rewrite to /dynamic/ if the user is logged in
        if (fernToken != null) {
            newPath = newPath.replace(/^\/_next\/data\/([^/]*)\/static\/(.*)/, "/_next/data/$1/dynamic/$2");
        }

        newPath = newPath.replace(
            /^\/_next\/data\/([^/]*)\/(static|dynamic)\/([^/]*)\/(.*)/,
            `/_next/data/$1/$2/${host}/$4`,
        );

        if (url.pathname === newPath) {
            return;
        }

        // eslint-disable-next-line no-console
        console.log(`Rewriting ${url.pathname} to ${newPath}`);

        return rewrite(new URL(newPath, request.url));
    }

    if (url.pathname.includes("/api/fern-docs/")) {
        const index = url.pathname.indexOf("/api/fern-docs/");
        const newPath = url.pathname.slice(index);

        // eslint-disable-next-line no-console
        console.log(`Rewriting ${url.pathname} to ${newPath}`);

        return rewrite(new URL(newPath, request.url));
    }

    if (url.pathname.endsWith("/sitemap.xml") && !url.pathname.includes("/api/fern-docs/")) {
        return rewrite(new URL("/api/fern-docs/sitemap.xml", request.url));
    }

    if (url.pathname.endsWith("/robots.txt") && !url.pathname.includes("/api/fern-docs/")) {
        return rewrite(new URL("/api/fern-docs/robots.txt", request.url));
    }

    /**
     * The following rewrite rules are used to determine if the path should be rewritten to /static or /dynamic
     * On the presence of fern_token, or if the query contains error=true, the path will be rewritten to /dynamic
     */
    if (fernToken != null || url.searchParams.get("error") === "true") {
        // eslint-disable-next-line no-console
        console.log(`Rewriting ${url.pathname} to /dynamic/${host}${url.pathname}`);

        return rewrite(new URL(`/dynamic/${host}${url.pathname}`, request.url));
    }

    // eslint-disable-next-line no-console
    console.log(`Rewriting ${url.pathname} to /static/${host}${url.pathname}`);
    return rewrite(new URL(`/static/${host}${url.pathname}`, request.url));
}
