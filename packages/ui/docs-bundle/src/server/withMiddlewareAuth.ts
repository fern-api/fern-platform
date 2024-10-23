import { FernUser } from "@fern-ui/fern-docs-auth";
import { NextRequest, NextResponse } from "next/server";
import { getAuthStateEdge } from "./auth/getAuthState";

export async function withMiddlewareAuth(
    request: NextRequest,
    next: (isLoggedIn: boolean, user: FernUser | undefined) => NextResponse,
): Promise<NextResponse> {
    const res = await getAuthStateEdge(request);

    if (res.isLoggedIn) {
        return next(true, res.user);
    }

    if (res.status === 200) {
        return next(false, undefined);
    }

    if (res.authorizationUrl) {
        return NextResponse.redirect(res.authorizationUrl);
    }

    return NextResponse.next({ status: res.status });
}
