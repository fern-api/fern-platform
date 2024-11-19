import { runReindex } from "@/server/run-reindex";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const GET = verifySignatureAppRouter(async (request: NextRequest): Promise<NextResponse> => {
    const domain = request.nextUrl.searchParams.get("domain");

    if (!domain) {
        return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }

    return NextResponse.json(await runReindex(domain));
});
