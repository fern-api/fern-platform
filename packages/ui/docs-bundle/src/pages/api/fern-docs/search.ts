import { checkViewerAllowedEdge } from "@/server/auth/checkViewerAllowed";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { loadWithUrl } from "@/server/loadWithUrl";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { SearchConfig, getSearchConfig } from "@fern-ui/search-utils";
import { provideRegistryService } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<SearchConfig>> {
    if (req.method !== "GET") {
        return NextResponse.json({ isAvailable: false }, { status: 405 });
    }

    const domain = getXFernHostEdge(req);
    const auth = await getAuthEdgeConfig(domain);

    try {
        const status = await checkViewerAllowedEdge(auth, req);
        if (status >= 400) {
            return NextResponse.json({ isAvailable: false }, { status });
        }

        const docs = await loadWithUrl(domain);

        if (!docs.ok) {
            // eslint-disable-next-line no-console
            console.error("Failed to load docs for domain", domain);
            return NextResponse.json({ isAvailable: false }, { status: 503 });
        }

        const searchInfo = docs.body.definition.search;
        const config = await getSearchConfig(provideRegistryService(), domain, searchInfo);
        return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
    } catch (e) {
        // TODO: sentry
        // eslint-disable-next-line no-console
        console.error(`Error fetching search config for domain ${domain}.`, e);
        return NextResponse.json({ isAvailable: false }, { status: 500 });
    }
}
