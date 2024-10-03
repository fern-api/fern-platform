import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    const domain = getXFernHostEdge(req);

    const state = req.nextUrl.searchParams.get("state");
    const redirectLocation = state ?? `https://${domain}/`;

    const res = NextResponse.redirect(redirectLocation);
    res.cookies.delete("fern_token");
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
}
