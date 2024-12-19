import { algoliaSearchApikey } from "@/server/env-variables";
import { withSearchApiKey } from "@/server/with-search-api-key";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = request.nextUrl.searchParams.get("domain");
    if (!domain) {
        return NextResponse.json(
            { error: "Domain is required" },
            { status: 400 }
        );
    }
    const fern_token = request.cookies.get("fern_token")?.value;
    const userToken =
        fern_token ??
        request.headers.get("X-User-Token") ??
        `anonymous-user-${randomUUID()}`;

    const apiKey = withSearchApiKey({
        searchApiKey: algoliaSearchApikey(),
        domain,
        roles: [],
        authed: false,
        userToken,
    });

    return NextResponse.json({ apiKey });
}
