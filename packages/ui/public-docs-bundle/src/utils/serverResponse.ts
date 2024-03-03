import { NextResponse } from "next/server";

/**
 * Returns a Response object with a JSON body
 */
export function jsonResponse<Data = unknown>(status: number, data: Data, init?: ResponseInit): NextResponse<string> {
    return new NextResponse(JSON.stringify(data), {
        ...init,
        status,
        headers: {
            ...init?.headers,
            "Content-Type": "application/json",
        },
    });
}

export function redirectResponse(location: string, init?: ResponseInit): NextResponse {
    return new NextResponse(undefined, {
        ...init,
        status: 302,
        headers: {
            ...init?.headers,
            Location: location,
        },
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
