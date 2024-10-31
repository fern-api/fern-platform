import { algoliaAppId, algoliaSearchApikey, algoliaWriteApiKey } from "@/server/env-variables";
import { withSearchApiKey } from "@/server/with-search-api-key";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const domain = request.nextUrl.searchParams.get("domain");
    if (!domain) {
        return NextResponse.json({ error: "Domain is required" }, { status: 400 });
    }
    const apiKey = withSearchApiKey({
        appId: algoliaAppId(),
        writeApiKey: algoliaWriteApiKey(),
        searchApiKey: algoliaSearchApikey(),
        domain,
        roles: [],
        authed: false,
    });

    return NextResponse.json({ apiKey });
}
