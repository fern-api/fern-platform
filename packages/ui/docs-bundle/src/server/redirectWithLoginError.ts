import { NextResponse } from "next/server";

export function redirectWithLoginError(location: URL | undefined, errorMessage: string): NextResponse {
    if (location == null) {
        return new NextResponse(null, { status: 500 });
    }

    const url = new URL(location);
    url.searchParams.set("loginError", errorMessage);
    // TODO: validate allowlist of domains to prevent open redirects
    return NextResponse.redirect(url.toString());
}
