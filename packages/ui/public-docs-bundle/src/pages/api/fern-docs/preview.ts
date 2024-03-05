import { NextRequest, NextResponse } from "next/server";
import { notFoundResponse, redirectResponse } from "../../../utils/serverResponse";

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
        res.cookies.set("_fern_docs_preview", host, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (typeof site === "string") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.set("_fern_docs_preview", `${site}.docs.buildwithfern.com`, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (clear === "true") {
        const res = redirectResponse(req.nextUrl.origin);
        res.cookies.delete("_fern_docs_preview");
        return res;
    }

    return notFoundResponse();
}
