import { loadWithUrl } from "@/server/loadWithUrl";
import { getXFernHostEdge } from "@/server/xfernhost/edge";
import { SearchConfig, getSearchConfig } from "@fern-ui/search-utils";
import { provideRegistryService } from "@fern-ui/ui";
import { checkViewerAllowedEdge } from "@fern-ui/ui/auth";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<SearchConfig>> {
    if (req.method !== "GET") {
        return NextResponse.json({ isAvailable: false }, { status: 405 });
    }

    const domain = getXFernHostEdge(req);

    try {
        const status = await checkViewerAllowedEdge(domain, req);
        if (status >= 400) {
            return NextResponse.json({ isAvailable: false }, { status });
        }

        const docs = await loadWithUrl(domain);

        if (docs == null) {
            // eslint-disable-next-line no-console
            console.error("Failed to load docs for domain", domain);
            return NextResponse.json({ isAvailable: false }, { status: 503 });
        }

        const searchInfo = docs.definition.search;
        const config = await getSearchConfig(provideRegistryService(), domain, searchInfo);
        return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
    } catch (e) {
        const id = Sentry.captureException(e, { level: "fatal" });
        // eslint-disable-next-line no-console
        console.error(`Error fetching search config for domain ${domain}. Sentry event ID: ${id}`, e);
        return NextResponse.json({ isAvailable: false }, { status: 500 });
    }
}
