import { FdrClient, FernNavigation } from "@fern-api/fdr-sdk";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { NextRequest, NextResponse } from "next/server";
import urljoin from "url-join";
import { buildUrlFromApiEdge } from "../../../utils/buildUrlFromApi";
import { jsonResponse } from "../../../utils/serverResponse";
import { getXFernHostEdge } from "../../../utils/xFernHost";

const REGISTRY_SERVICE = new FdrClient({
    environment: process.env.NEXT_PUBLIC_FDR_ORIGIN ?? "https://registry.buildwithfern.com",
});

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const xFernHost = getXFernHostEdge(req);
    const headers = new Headers();
    headers.set("x-fern-host", xFernHost);

    const url = buildUrlFromApiEdge(xFernHost, req);
    // const docs = await loadWithUrl(url);

    const response = await REGISTRY_SERVICE.docs.v2.read.getDocsForUrl(url);

    if (!response.ok) {
        return jsonResponse(404, [], { headers });
    }

    const node = FernNavigation.utils.convertLoadDocsForUrlResponse(response.body);
    const slugCollector = NodeCollector.collect(node);
    const urls = slugCollector.getPageSlugs().map((slug) => urljoin(xFernHost, slug));

    return jsonResponse(200, urls, { headers });
}
