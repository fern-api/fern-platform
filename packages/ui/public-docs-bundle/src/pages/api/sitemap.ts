import { buildUrl } from "@fern-ui/ui";
import { NextRequest, NextResponse } from "next/server";
import { getAllUrlsFromDocsConfig } from "../../utils/getAllUrlsFromDocsConfig";
import { loadWithUrl } from "../../utils/loadWithUrl";
import { jsonResponse } from "../../utils/serverResponse";
import { toValidPathname } from "../../utils/toValidPathname";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    let xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host");
    const headers: Record<string, string> = {};

    if (xFernHost != null) {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        xFernHost = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;
        headers["x-fern-host"] = xFernHost;
    } else {
        return jsonResponse(400, [], headers);
    }

    try {
        const docs = await loadWithUrl(
            buildUrl({ host: xFernHost, pathname: toValidPathname(req.nextUrl.searchParams.get("basePath")) }),
        );

        if (docs == null) {
            return jsonResponse(404, [], headers);
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.baseUrl.domain,
            docs.baseUrl.basePath,
            docs.definition.config,
            docs.definition.apis,
        );

        return jsonResponse(200, urls, headers);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return jsonResponse(500, [], headers);
    }
}
