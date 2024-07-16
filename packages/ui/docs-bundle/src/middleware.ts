import { get } from "@vercel/edge-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest): Promise<NextResponse> {
    const requestHeaders = new Headers(request.headers);

    if (!requestHeaders.has("x-fern-host")) {
        const host =
            process.env.NEXT_PUBLIC_DOCS_DOMAIN ??
            request.cookies.get("_fern_docs_preview")?.value ??
            (await getCanonicalHost(request)) ??
            request.nextUrl.host;
        requestHeaders.set("x-fern-host", host);
    }

    return NextResponse.next({ request: { headers: requestHeaders } });
}

async function getCanonicalHost(request: NextRequest): Promise<string | undefined> {
    const canonicalUrls = await get<Record<string, string>>("cannonical-url");
    return canonicalUrls?.[request.nextUrl.host];
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!_next/static|_next/image).*)",
    ],
};
