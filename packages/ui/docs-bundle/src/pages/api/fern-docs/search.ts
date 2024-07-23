import { SearchConfig, getSearchConfig } from "@fern-ui/search-utils";
// eslint-disable-next-line import/no-internal-modules
import { checkViewerAllowedEdge } from "@fern-ui/ui/auth";
import * as Sentry from "@sentry/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost";

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

        const config = await getSearchConfig(domain);
        return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
    } catch (e) {
        Sentry.captureException(e);
        return NextResponse.json({ isAvailable: false }, { status: 500 });
    }
}
