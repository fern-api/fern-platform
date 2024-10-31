import { browseInitialResults, type InitialResultsResponse } from "@/server/browse-results";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse<InitialResultsResponse>> {
    const domain = request.nextUrl.searchParams.get("domain");
    if (domain == null) {
        return new NextResponse(null, { status: 400 });
    }
    const results = await browseInitialResults(domain);
    return NextResponse.json(results);
}
