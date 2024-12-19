import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { FernUser } from "@fern-docs/auth";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";
import { FernNextResponse } from "./FernNextResponse";
import { getAuthStateEdge } from "./auth/getAuthStateEdge";
import { withSecureCookie } from "./auth/with-secure-cookie";
import { getHostEdge } from "./xfernhost/edge";

/**
 * @param pathname must be specified because `_next/data` must be stripped out of the pathname
 * @param next if the user is allowed to access the page, continue to the next middleware handler
 * @returns
 */
export async function withMiddlewareAuth(
    request: NextRequest,
    pathname: string,
    next: (isLoggedIn: boolean, user: FernUser | undefined) => NextResponse
): Promise<NextResponse> {
    let fernToken: string | undefined;
    const res = await getAuthStateEdge(request, pathname, (token: string) => {
        fernToken = token;
    });

    if (res.authed) {
        const response = next(true, res.user);

        // set the fern token cookie if it changed (e.g. if the refresh token was used)
        if (fernToken) {
            response.cookies.set(
                COOKIE_FERN_TOKEN,
                fernToken,
                withSecureCookie(withDefaultProtocol(getHostEdge(request)))
            );
        }

        return response;
    }

    if (res.ok) {
        return next(false, undefined);
    }

    if (res.authorizationUrl) {
        return FernNextResponse.redirect(request, {
            destination: res.authorizationUrl,
            allowedDestinations: res.allowedDestinations,
        });
    }

    return NextResponse.next({ status: 401 });
}
