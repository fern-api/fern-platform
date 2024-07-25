import { NextRequest, NextResponse } from "next/server";

/**
 * Why do we need this?
 *
 * This is a workaround for ISR pages that return a redirect to an external URL.
 * When the page is built, NextJS will send a HEAD request to the destination URL to check if it is valid.
 * This would add undesireable load to the destination server (e.g. the customer's server).
 *
 * By using this function, we can intercept the HEAD request and return a 308 redirect to the destination URL.
 */

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET" && req.method !== "HEAD") {
        return new NextResponse(null, { status: 405 });
    }

    const destination = req.nextUrl.searchParams.get("destination");
    if (destination == null) {
        return new NextResponse(null, { status: 400 });
    } else if (destination.startsWith("http://") || destination.startsWith("https://")) {
        return NextResponse.redirect(destination, { status: 308 });
    } else if (destination.startsWith("/")) {
        return NextResponse.redirect(new URL(destination, req.nextUrl.origin).toString(), { status: 308 });
    } else {
        return new NextResponse(null, { status: 400 });
    }
}
