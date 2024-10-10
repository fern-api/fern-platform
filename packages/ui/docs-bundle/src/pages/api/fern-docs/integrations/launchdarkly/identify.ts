import { getXFernHostHeaderFallbackOrigin } from "@/server/xfernhost/edge";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { COOKIE_EMAIL } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    const email = req.nextUrl.searchParams.get(COOKIE_EMAIL);

    // TODO: validate allowlist of domains to prevent open redirects
    const res = NextResponse.redirect(withDefaultProtocol(getXFernHostHeaderFallbackOrigin(req)));

    if (email) {
        res.cookies.set({ name: COOKIE_EMAIL, value: email });
    }

    return res;
}
