import { getAllUrlsFromDocsConfig, getHostFromUrl, stripStagingUrl } from "@fern-ui/fdr-utils";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse } from "../../../utils/serverResponse";

export const runtime = "edge";

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    let xFernHost: string | undefined = req.headers.get("x-fern-host") ?? req.nextUrl.href;

    if (xFernHost.includes("localhost")) {
        xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN;
    }

    xFernHost = getHostFromUrl(xFernHost);

    const headers: Record<string, string> = {};

    if (xFernHost != null) {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        headers["x-fern-host"] = xFernHost;
    } else {
        return jsonResponse(400, [], headers);
    }

    try {
        const docs = await loadWithUrl(stripStagingUrl(xFernHost));

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
