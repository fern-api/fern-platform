import { COOKIE_EMAIL } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    const email = req.nextUrl.searchParams.get(COOKIE_EMAIL);

    const res = NextResponse.redirect(new URL("/", req.url));

    if (email) {
        res.cookies.set({ name: COOKIE_EMAIL, value: email });
    }

    return res;
}
