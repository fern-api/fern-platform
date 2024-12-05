import { track } from "@/server/analytics/posthog";
import { algoliaAppId, algoliaWriteApiKey, fdrEnvironment, fernToken } from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { algoliaIndexSettingsTask, algoliaIndexerTask } from "@fern-ui/fern-docs-search-server/tasks";
import { addLeadingSlash } from "@fern-ui/fern-docs-utils";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const domain = getDocsDomainEdge(request);

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
            domain,
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

        return NextResponse.json(response);
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);

        await track("algolia_reindex_error", {
            indexName: SEARCH_INDEX,
            domain,
            error: String(error),
        });

        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
