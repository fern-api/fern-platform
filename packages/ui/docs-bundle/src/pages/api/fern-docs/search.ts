import { getAuthStateEdge } from "@/server/auth/getAuthStateEdge";
import { loadWithUrl } from "@/server/loadWithUrl";
import { getInkeepSettings } from "@fern-ui/fern-docs-edge-config";
import { SearchConfig, getSearchConfig } from "@fern-ui/search-utils";
import { provideRegistryService } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<SearchConfig>> {
    if (req.method !== "GET") {
        return NextResponse.json({ isAvailable: false }, { status: 405 });
    }

    const authState = await getAuthStateEdge(req, req.nextUrl.pathname);

    if (!authState.ok) {
        return NextResponse.json({ isAvailable: false }, { status: authState.authed ? 403 : 401 });
    }

    const docs = await loadWithUrl(authState.host);

    if (!docs.ok) {
        return NextResponse.json({ isAvailable: false }, { status: 503 });
    }

    const inkeepSettings = await getInkeepSettings(authState.host);
    const searchInfo = docs.body.definition.search;
    const config = await getSearchConfig(provideRegistryService(), searchInfo, inkeepSettings);
    return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
}
