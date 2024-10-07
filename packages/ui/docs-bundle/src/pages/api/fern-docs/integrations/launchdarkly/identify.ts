import { COOKIE_EMAIL } from "@fern-ui/fern-docs-utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse> {
    const email = req.nextUrl.searchParams.get(COOKIE_EMAIL);

    if (email) {
        cookies().set({ name: COOKIE_EMAIL, value: email });
    }

    return NextResponse.redirect(new URL("/", req.url));
}
