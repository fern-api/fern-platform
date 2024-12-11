import { NextRequest, NextResponse } from "next/server";
import { FernNextResponse } from "./FernNextResponse";

export function redirectWithLoginError(
    request: NextRequest,
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
    // TODO: check if we need to provide allowedDestinations (getAllowedRedirectUrls(edgeConfig))
    return FernNextResponse.redirect(request, { destination: url });
}
