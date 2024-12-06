import { track } from "@/server/analytics/posthog";
import { algoliaAppId, algoliaWriteApiKey, fdrEnvironment, fernToken } from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { algoliaIndexSettingsTask, algoliaIndexerTask } from "@fern-ui/fern-docs-search-server/tasks";
import { addLeadingSlash, withoutStaging } from "@fern-ui/fern-docs-utils";
import { NextApiRequest, NextApiResponse } from "next/types";

export const maxDuration = 900; // 15 minutes

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    const domain = getDocsDomainNode(req);

    try {
        const start = Date.now();
        const [authEdgeConfig, featureFlags] = await Promise.all([getAuthEdgeConfig(domain), getFeatureFlags(domain)]);

        await algoliaIndexSettingsTask({
            appId: algoliaAppId(),
            writeApiKey: algoliaWriteApiKey(),
            indexName: SEARCH_INDEX,
        });

        const response = await algoliaIndexerTask({
            appId: algoliaAppId(),
            writeApiKey: algoliaWriteApiKey(),
            indexName: SEARCH_INDEX,
            environment: fdrEnvironment(),
            fernToken: fernToken(),
            domain: withoutStaging(domain),
            authed: (node) => {
                if (authEdgeConfig == null) {
                    return false;
                }

                return withBasicTokenAnonymous(authEdgeConfig, addLeadingSlash(node.slug)) === Gate.DENY;
            },
            ...featureFlags,
        });

        const end = Date.now();

        await track("algolia_reindex", {
            indexName: SEARCH_INDEX,
            durationMs: end - start,
            domain,
            added: response.addedObjectIDs.length,
            updated: response.updatedObjectIDs.length,
            deleted: response.deletedObjectIDs.length,
        });

        return res.status(200).json(response);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        await track("algolia_reindex_error", {
            indexName: SEARCH_INDEX,
            domain,
            error: String(error),
        });

        return res.status(500).send("Internal server error");
    }
}
