import { NextResponse } from "next/server";

/**
 * Returns a Response object with a JSON body
 */
export function jsonResponse<Data = unknown>(status: number, data: Data, init?: ResponseInit): NextResponse<string> {
    const headers = new Headers(init?.headers);
    headers.set("Content-Type", "application/json");
    return new NextResponse(JSON.stringify(data), {
        ...init,
        status,
        headers,
    });
}

export function redirectResponse(location: string, init?: ResponseInit): NextResponse {
    const headers = new Headers(init?.headers);
    headers.set("Location", location);
    return new NextResponse(undefined, {
        ...init,
        status: 302,
        headers,
    });
}

export function notFoundResponse<Body = unknown>(
    body?: BodyInit | null | undefined,
    init?: ResponseInit,
): NextResponse<Body> {
    return new NextResponse<Body>(body, {
        ...init,
        status: 404,
    });
}
