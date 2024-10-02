import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = state ?? req.nextUrl.origin;

    const res = NextResponse.redirect(redirectLocation);
    res.cookies.delete("fern_token");
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
}
