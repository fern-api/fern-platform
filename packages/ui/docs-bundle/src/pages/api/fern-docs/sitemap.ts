import { buildUrl, getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse } from "../../../utils/serverResponse";
import { toValidPathname } from "../../../utils/toValidPathname";

export const runtime = "edge";

function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }
    const urlObj = new URL(url);
    return urlObj.host;
}

export default async function GET(req: NextRequest): Promise<NextResponse> {
    if (req.method !== "GET") {
        return new NextResponse(null, { status: 405 });
    }

    let xFernHost = req.headers.get("x-fern-host") ?? getHostFromUrl(req.nextUrl.href);

    if (xFernHost != null && xFernHost.includes("localhost")) {
        xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN;
    }

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
