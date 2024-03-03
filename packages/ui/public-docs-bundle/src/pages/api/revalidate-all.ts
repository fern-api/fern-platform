import { buildUrl } from "@fern-ui/ui";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";
import { getAllUrlsFromDocsConfig } from "../../utils/getAllUrlsFromDocsConfig";
import { loadWithUrl } from "../../utils/loadWithUrl";
import { notFoundResponse } from "../../utils/serverResponse";
import { toValidPathname } from "../../utils/toValidPathname";

function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }
    const urlObj = new URL(url);
    return urlObj.host;
}

const handler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<{ pathsRevalidated: string[] }>,
): Promise<unknown> => {
    if (req.method !== "POST") {
        return new NextResponse(null, { status: 405 });
    }
    try {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = req.headers["x-fern-host"] ?? getHostFromUrl(req.url);
        if (typeof xFernHost !== "string") {
            return notFoundResponse();
        }
        const hostWithoutTrailingSlash = xFernHost.endsWith("/") ? xFernHost.slice(0, -1) : xFernHost;

        const docs = await loadWithUrl(
            buildUrl({
                host: hostWithoutTrailingSlash,
                pathname: toValidPathname(req.query.basePath),
            }),
        );

        if (docs == null) {
            // return notFoundResponse();
            return res.status(404).json({ pathsRevalidated: [] });
        }

        const urls = await getAllUrlsFromDocsConfig(
            docs.baseUrl.domain,
            docs.baseUrl.basePath,
            docs.definition.config,
            docs.definition.apis,
        );

        await Promise.all(urls.map(async (url) => await res.revalidate(`/static/${url}`)));

        // return jsonResponse(200, { pathsRevalidated: urls });
        return res.status(200).json({ pathsRevalidated: urls });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        // return new NextResponse(null, { status: 500 });
        return res.status(500).json({ pathsRevalidated: [] });
    }
};

export default handler;
