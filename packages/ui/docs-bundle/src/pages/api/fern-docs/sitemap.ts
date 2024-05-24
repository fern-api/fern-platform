import { buildUrl, getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse } from "../../../utils/serverResponse";
import { toValidPathname } from "../../../utils/toValidPathname";
import { getXFernHostEdge } from "../../../utils/xFernHost";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    const xFernHost = getXFernHostEdge(req);
    const headers: Record<string, string> = {
        "x-fern-host": xFernHost,
    };

    try {
        const url = buildUrl({ host: xFernHost, pathname: toValidPathname(req.nextUrl.searchParams.get("basePath")) });
        // eslint-disable-next-line no-console
        console.log("[sitemap] Loading docs for", url);
        const docs = await loadWithUrl(url);

        if (docs == null) {
            return jsonResponse(404, [], headers);
        }

        const urls = getAllUrlsFromDocsConfig(
            xFernHost,
            docs.baseUrl.basePath,
            docs.definition.config.navigation,
            docs.definition.apis,
        );

        return jsonResponse(200, urls, headers);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return jsonResponse(500, [], headers);
    }
}
