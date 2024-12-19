import {
    withDeleteCookie,
    withSecureCookie,
} from "@/server/auth/with-secure-cookie";
import { notFoundResponse, redirectResponse } from "@/server/serverResponse";
import { COOKIE_FERN_DOCS_PREVIEW } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }
    const host = req.nextUrl.searchParams.get("host");
    const site = req.nextUrl.searchParams.get("site");
    const clear = req.nextUrl.searchParams.get("clear");
    if (typeof host === "string") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.set(
            COOKIE_FERN_DOCS_PREVIEW,
            host,
            withSecureCookie(req.nextUrl.origin)
        );
        return res;
    } else if (typeof site === "string") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.set(
            COOKIE_FERN_DOCS_PREVIEW,
            `${site}.docs.buildwithfern.com`,
            withSecureCookie(req.nextUrl.origin)
        );
        return res;
    } else if (clear === "true") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.delete(
            withDeleteCookie(COOKIE_FERN_DOCS_PREVIEW, req.nextUrl.origin)
        );
        return res;
    }

    return notFoundResponse();
}
