import { algoliaSearchApikey } from "@/server/env-variables";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import {
    DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
    SEARCH_INDEX,
    getSearchApiKey,
} from "@fern-ui/fern-docs-search-server/algolia";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 5;
export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(request: NextRequest): Promise<NextResponse> {
    const domain = getDocsDomainEdge(request);
    const fern_token = request.cookies.get("fern_token")?.value;
    const userToken = fern_token ?? request.headers.get("X-User-Token") ?? `anonymous-user-${randomUUID()}`;

    const apiKey = getSearchApiKey({
        parentApiKey: algoliaSearchApikey(),
        domain,
        roles: [],
        authed: false,
        expiresInSeconds: DEFAULT_SEARCH_API_KEY_EXPIRATION_SECONDS,
        searchIndex: SEARCH_INDEX,
        userToken,
    });

    return NextResponse.json({ apiKey }, { headers: { "Cache-Control": "no-store" } });
}
