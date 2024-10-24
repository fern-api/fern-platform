import { FernUser } from "@fern-ui/fern-docs-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthStateEdge } from "./auth/getAuthStateEdge";

/**
 * @param pathname must be specified because `_next/data` must be stripped out of the pathname
 * @param next if the user is allowed to access the page, continue to the next middleware handler
 * @returns
 */
export async function withMiddlewareAuth(
    request: NextRequest,
    pathname: string,
    next: (isLoggedIn: boolean, user: FernUser | undefined) => NextResponse,
): Promise<NextResponse> {
    const res = await getAuthStateEdge(request, pathname);

    if (res.authed) {
        return next(true, res.user);
    }

    if (res.ok) {
        return next(false, undefined);
    }

    if (res.authorizationUrl) {
        return NextResponse.redirect(res.authorizationUrl);
    }

    return NextResponse.next({ status: 401 });
}
