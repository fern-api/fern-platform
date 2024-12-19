import { DocsKVCache } from "@/server/DocsCache";
import { DocsLoader } from "@/server/DocsLoader";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
    queueAlgoliaReindex,
    queueTurbopufferReindex,
} from "@/server/queue-reindex";
import { Revalidator } from "@/server/revalidator";
import { getDocsDomainNode, getHostNode } from "@/server/xfernhost/node";
import { NodeCollector } from "@fern-api/fdr-sdk/navigation";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { withoutStaging } from "@fern-docs/utils";
import type { FernDocs } from "@fern-fern/fern-docs-sdk";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export const config = {
    maxDuration: 300,
};

// reduce concurrency per domain
const DEFAULT_BATCH_SIZE = 100;

function isSuccessResult(
    result: FernDocs.RevalidationResult
): result is FernDocs.SuccessfulRevalidation {
    return result.success;
}

function isFailureResult(
    result: FernDocs.RevalidationResult
): result is FernDocs.FailedRevalidation {
    return !result.success;
}

function chunk<T>(arr: T[], size: number): T[][] {
    return arr.reduce(
        (acc, _, i) => (i % size ? acc : [...acc, arr.slice(i, i + size)]),
        [] as T[][]
    );
}

// TODO: gate this using a fern token
const handler: NextApiHandler = async (
    req: NextApiRequest,
    res: NextApiResponse<FernDocs.RevalidateAllV3Response>
): Promise<unknown> => {
    const domain = getDocsDomainNode(req);
    const host = getHostNode(req) ?? domain;

    // never provide a token here because revalidation should only be done on public routes (for now)
    const loader = DocsLoader.for(domain, host);

    const flags = await getFeatureFlags(domain);
    const root = await loader.withFeatureFlags(flags).root();

    if (!root) {
        /**
         * If the error is UnauthorizedError, we don't need to revalidate, since all the routes require SSR.
         */
        return res
            .status(loader.error?.error === "UnauthorizedError" ? 200 : 404)
            .json({ successfulRevalidations: [], failedRevalidations: [] });
    }

    const revalidate = new Revalidator(res, domain);
    const slugs = NodeCollector.collect(root).staticPageSlugs;

    // queue algolia reindexing
    try {
        const orgMetadata = await getOrgMetadataForDomain(
            withoutStaging(domain)
        );
        if (orgMetadata?.isPreviewUrl === false) {
            await queueAlgoliaReindex(host, withoutStaging(domain), root.slug);
            if (flags.isAskAiEnabled) {
                await queueTurbopufferReindex(
                    host,
                    withoutStaging(domain),
                    root.slug
                );
            }
        }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
    }

    try {
        const cache = DocsKVCache.getInstance(domain);
        const previouslyVisitedSlugs = (await cache.getVisitedSlugs()).filter(
            (slug) => !slugs.includes(slug)
        );

        const results: FernDocs.RevalidationResult[] = [];
        for (const batch of chunk(slugs, DEFAULT_BATCH_SIZE)) {
            results.push(...(await revalidate.batch(batch)));
        }

        // Revalidate previously visited slugs
        await revalidate.batch(previouslyVisitedSlugs);

        const successfulRevalidations = results.filter(isSuccessResult);
        const failedRevalidations = results.filter(isFailureResult);

        return res
            .status(
                failedRevalidations.length === 0
                    ? 200
                    : successfulRevalidations.length === 0
                      ? 500
                      : 207
            )
            .json({ successfulRevalidations, failedRevalidations });
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);
        return res
            .status(500)
            .json({ successfulRevalidations: [], failedRevalidations: [] });
    }
};

export default handler;
