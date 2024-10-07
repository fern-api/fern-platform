import { DocsKVCache } from "@/server/DocsCache";
import { getAuthEdgeConfig } from "@/server/auth/getAuthEdgeConfig";
import { Revalidator } from "@/server/revalidator";
import { pruneWithBasicTokenPublic } from "@/server/withBasicTokenPublic";
import { getXFernHostNode } from "@/server/xfernhost/node";
import { FdrAPI } from "@fern-api/fdr-sdk";
import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import type { FernDocs } from "@fern-fern/fern-docs-sdk";
import { provideRegistryService } from "@fern-ui/ui";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const config = {
    maxDuration: 300,
};

// reduce concurrency per domain
const DEFAULT_BATCH_SIZE = 100;

function isSuccessResult(result: FernDocs.RevalidationResult): result is FernDocs.SuccessfulRevalidation {
    return result.success;
}

function isFailureResult(result: FernDocs.RevalidationResult): result is FernDocs.FailedRevalidation {
    return !result.success;
}

function chunk<T>(arr: T[], size: number): T[][] {
    return arr.reduce((acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]), [] as T[][]);
}

const handler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<FernDocs.RevalidateAllV3Response>,
): Promise<unknown> => {
    const xFernHost = getXFernHostNode(req, true);

    const revalidate = new Revalidator(res, xFernHost);

    try {
        const docs = await provideRegistryService().docs.v2.read.getDocsForUrl({ url: FdrAPI.Url(xFernHost) });

        if (!docs.ok) {
            /**
             * If the error is UnauthorizedError, we don't need to revalidate, since all the routes require SSR.
             */
            return res
                .status(docs.error.error === "UnauthorizedError" ? 200 : 404)
                .json({ successfulRevalidations: [], failedRevalidations: [] });
        }

        let node = FernNavigation.utils.toRootNode(docs.body);

        const auth = await getAuthEdgeConfig(xFernHost);
        if (auth?.type === "basic_token_verification") {
            node = pruneWithBasicTokenPublic(auth, node);
        }

        const collector = NodeCollector.collect(node);
        const slugs = collector.pageSlugs;

        const cache = DocsKVCache.getInstance(xFernHost);
        const previouslyVisitedSlugs = (await cache.getVisitedSlugs()).filter((slug) => !slugs.includes(slug));

        const results: FernDocs.RevalidationResult[] = [];
        for (const batch of chunk(slugs, DEFAULT_BATCH_SIZE)) {
            results.push(...(await revalidate.batch(batch)));
        }

        // Revalidate previously visited slugs
        await revalidate.batch(previouslyVisitedSlugs);

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
