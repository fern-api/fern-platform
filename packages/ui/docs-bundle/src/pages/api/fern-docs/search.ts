import { SearchConfig, getSearchConfig, type SearchRequest } from "@fern-ui/search-utils";
import { NextRequest, NextResponse } from "next/server";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export default async function handler(req: NextRequest): Promise<NextResponse<SearchConfig>> {
    if (req.method !== "POST") {
        return NextResponse.json({ isAvailable: false }, { status: 405 });
    }

    const domain = getXFernHostEdge(req);

    try {
        const { searchInfo }: SearchRequest = (await req.json()) ?? {};
        const config = await getSearchConfig(domain, { searchInfo });
        return NextResponse.json(config, { status: config.isAvailable ? 200 : 503 });
    } catch (e) {
        return NextResponse.json({ isAvailable: false }, { status: 500 });
    }
}
