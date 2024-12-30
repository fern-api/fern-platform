import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest): Response {
    const origin = request.headers.get("origin");
    if (origin != null && (origin.includes("octo") || origin.includes("localhost"))) {
        return NextResponse.next({
            headers: {
                "Access-Control-Allow-Origin": origin,
            },
        });
    } else if (request.headers.get("host")?.includes("localhost")) {
        return NextResponse.next({
            headers: {
                "Access-Control-Allow-Origin": "*",
            },
        });
    }
    return NextResponse.error();
}

export const config = {
    matcher: "/octoai/:path*",
};
