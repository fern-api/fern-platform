import { FernRevalidation } from "@fern-fern/revalidation-sdk";
import { isPlainObject } from "@fern-ui/core-utils";
import { buildUrl } from "@fern-ui/fdr-utils";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { RevalidatePathResult, isFailureResult, isSuccessResult } from "../../../utils/revalidate-types";

function getHostFromUrl(url: string | undefined): string | undefined {
    if (url == null) {
        return undefined;
    }
    const urlObj = new URL(url);
    return urlObj.host;
}

export const config = {
    maxDuration: 300,
};

const handler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<FernRevalidation.BulkRevalidateResponse>,
): Promise<unknown> => {
    if (req.method !== "POST") {
        return res.status(405).json({ successfulRevalidations: [], failedRevalidations: [] });
    }
    try {
        // when we call res.revalidate() nextjs uses
        // req.headers.host to make the network request
        const xFernHost = getHostFromBody(req.body) ?? req.headers["x-fern-host"] ?? getHostFromUrl(req.url);
        const slugs = getSlugsFromBody(req.body);
        if (typeof xFernHost !== "string") {
            return res.status(404).json({ successfulRevalidations: [], failedRevalidations: [] });
        }

        const urls = slugs.map((slug) => buildUrl({ host: xFernHost, pathname: slug }));

        const results = await Promise.all(
            urls.map(async (url): Promise<RevalidatePathResult> => {
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

function getHostFromBody(body: unknown): string | undefined {
    if (body == null || !isPlainObject(body)) {
        return undefined;
    }

    if (typeof body.host === "string") {
        return body.host;
    }

    return undefined;
}

function getSlugsFromBody(body: unknown): string[] {
    if (body == null || !isPlainObject(body)) {
        return [];
    }

    if (Array.isArray(body.slugs)) {
        return body.slugs;
    }

    return [];
}
