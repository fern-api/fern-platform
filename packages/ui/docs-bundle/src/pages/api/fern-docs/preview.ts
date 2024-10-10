import { notFoundResponse, redirectResponse } from "@/server/serverResponse";
import { COOKIE_FERN_DOCS_PREVIEW } from "@fern-ui/fern-docs-utils";
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
        res.cookies.set(COOKIE_FERN_DOCS_PREVIEW, host, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (typeof site === "string") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.set(COOKIE_FERN_DOCS_PREVIEW, `${site}.docs.buildwithfern.com`, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (clear === "true") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.delete(COOKIE_FERN_DOCS_PREVIEW);
        return res;
    }

    return notFoundResponse();
}
