import { buildUrl, getAllUrlsFromDocsConfig } from "@fern-ui/fdr-utils";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { loadWithUrl } from "../../../utils/loadWithUrl";
import { toValidPathname } from "../../../utils/toValidPathname";
import { getXFernHostNode } from "../../../utils/xFernHost";

export const config = {
    maxDuration: 300,
};

type RevalidatePathResult = RevalidatePathSuccessResult | RevalidatePathErrorResult;

interface RevalidatePathSuccessResult {
    success: true;
    url: string;
}

function isSuccessResult(result: RevalidatePathResult): result is RevalidatePathSuccessResult {
    return result.success;
}

interface RevalidatePathErrorResult {
    success: false;
    url: string;
    message: string;
}

function isFailureResult(result: RevalidatePathResult): result is RevalidatePathErrorResult {
    return !result.success;
}

type RevalidatedPaths = {
    successfulRevalidations: RevalidatePathSuccessResult[];
    failedRevalidations: RevalidatePathErrorResult[];
};

const handler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<RevalidatedPaths>,
): Promise<unknown> => {
    if (req.method !== "POST") {
        return res.status(405).json({ successfulRevalidations: [], failedRevalidations: [] });
    }
    try {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = getXFernHostNode(req);

        const url = buildUrl({
            host: xFernHost,
            pathname: toValidPathname(req.query.basePath),
        });
        // eslint-disable-next-line no-console
        console.log("[revalidate-all] Loading docs for", url);
        const docs = await loadWithUrl(url);

        if (docs == null) {
            // return notFoundResponse();
            return res.status(404).json({ successfulRevalidations: [], failedRevalidations: [] });
        }

        const urls = getAllUrlsFromDocsConfig(
            xFernHost,
            docs.baseUrl.basePath,
            docs.definition.config.navigation,
            docs.definition.apis,
        );

        const results = await Promise.all(
            urls.map(async (url): Promise<RevalidatePathResult> => {
                // eslint-disable-next-line no-console
                console.log(`Revalidating ${url}`);
                try {
                    await res.revalidate(`/static/${encodeURI(url)}`);
                    return { success: true, url };
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error(e);
                    return { success: false, url, message: e instanceof Error ? e.message : "Unknown error." };
                }
            }),
        );

        const successfulRevalidations = results.filter(isSuccessResult);
        const failedRevalidations = results.filter(isFailureResult);

        return res
            .status(failedRevalidations.length === 0 ? 200 : successfulRevalidations.length === 0 ? 500 : 207)
            .json({ successfulRevalidations, failedRevalidations });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res.status(500).json({ successfulRevalidations: [], failedRevalidations: [] });
    }
};

export default handler;
