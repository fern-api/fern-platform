import { browseInitialResults } from "@/server/browse-results";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get("domain");
    if (domain == null) {
        return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }
    const results = await browseInitialResults(domain);
    return NextResponse.json(results);
}
