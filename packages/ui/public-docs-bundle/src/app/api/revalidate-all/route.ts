import { buildUrl } from "@fern-ui/ui";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { jsonResponse, notFoundResponse } from "../../../utils/serverResponse";
import { getAllUrlsFromDocsConfig, toValidPathname } from "../sitemap/route";

export const runtime = "edge";

export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = process.env.NEXT_PUBLIC_DOCS_DOMAIN ?? req.headers.get("x-fern-host");
        if (typeof xFernHost !== "string") {
            return notFoundResponse();
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;

        const docs = await loadWithUrl(
            buildUrl({
                host: hostWithoutTrailingSlash,
                pathname: toValidPathname(req.nextUrl.searchParams.get("basePath")),
            }),
        );

        if (docs == null) {
            return notFoundResponse();
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.baseUrl.domain,
            docs.baseUrl.basePath,
            docs.definition.config,
            docs.definition.apis,
        );

        urls.map((url) => revalidatePath(`/static/${url}`, "page"));

        return jsonResponse(200, { pathsRevalidated: urls });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return new NextResponse(null, { status: 500 });
    }
}
