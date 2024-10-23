import { getAuthStateEdge } from "@/server/auth/getAuthState";
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

    const authState = await getAuthStateEdge(req);

    if (!authState.isLoggedIn && authState.status >= 400) {
        return NextResponse.json({ isAvailable: false }, { status: authState.status });
    }

    const docs = await loadWithUrl(authState.xFernHost);

    if (!docs.ok) {
        return NextResponse.json({ isAvailable: false }, { status: 503 });
    }

    const inkeepSettings = await getInkeepSettings(authState.xFernHost);
    const searchInfo = docs.body.definition.search;
    const config = await getSearchConfig(provideRegistryService(), searchInfo, inkeepSettings);
    return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
}
