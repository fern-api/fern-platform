import { NextResponse } from "next/server";

export function redirectWithLoginError(
    location: URL | undefined,
    error: string,
    error_description: string | null | undefined,
): NextResponse {
    if (location == null) {
        return new NextResponse(null, { status: 500 });
    }

    const url = new URL(location);
    url.searchParams.set("error", error);
    if (error_description != null) {
        url.searchParams.set("error_description", error_description);
    }
    // TODO: validate allowlist of domains to prevent open redirects
    return NextResponse.redirect(url.toString());
}
