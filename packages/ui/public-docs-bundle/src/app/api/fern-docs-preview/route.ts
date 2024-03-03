import type { NextRequest, NextResponse } from "next/server";
import { notFoundResponse, redirectResponse } from "../../../utils/serverResponse";

export const runtime = "edge";

export async function GET({ nextUrl }: NextRequest): Promise<NextResponse> {
    const host = nextUrl.searchParams.get("host");
    const site = nextUrl.searchParams.get("site");
    const clear = nextUrl.searchParams.get("clear");
    if (typeof host === "string") {
        const res = redirectResponse("/");
        res.cookies.set("_fern_docs_preview", host, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (typeof site === "string") {
        const res = redirectResponse("/");
        res.cookies.set("_fern_docs_preview", `${site}.docs.buildwithfern.com`, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            path: "/",
        });
        return res;
    } else if (clear === "true") {
        const res = redirectResponse("/");
        res.cookies.delete("_fern_docs_preview");
        return res;
    }

    return notFoundResponse();
}
