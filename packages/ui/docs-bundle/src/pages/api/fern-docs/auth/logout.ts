import { COOKIE_ACCESS_TOKEN, COOKIE_FERN_TOKEN, COOKIE_REFRESH_TOKEN } from "@/server/constants";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getXFernHostEdge(req);

    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = state ?? `https://${domain}/`;

    const res = NextResponse.redirect(redirectLocation);
    res.cookies.delete(COOKIE_FERN_TOKEN);
    res.cookies.delete(COOKIE_ACCESS_TOKEN);
    res.cookies.delete(COOKIE_REFRESH_TOKEN);
    return res;
}
