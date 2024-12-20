import { track } from "@/server/analytics/posthog";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
  algoliaAppId,
  algoliaWriteApiKey,
  fdrEnvironment,
  fernToken,
} from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-docs/edge-config";
import {
  SEARCH_INDEX,
  algoliaIndexSettingsTask,
  algoliaIndexerTask,
} from "@fern-docs/search-server/algolia";
import { addLeadingSlash, withoutStaging } from "@fern-docs/utils";
import { NextApiRequest, NextApiResponse } from "next/types";

export const maxDuration = 900; // 15 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const domain = getDocsDomainNode(req);

  try {
    const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
    if (orgMetadata == null) {
      return res.status(404).send("Not found");
    }

    // If the domain is a preview URL, we don't want to reindex
    if (orgMetadata.isPreviewUrl) {
      return res.status(200).json({
        added: 0,
        updated: 0,
        deleted: 0,
        unindexable: 0,
      });
    }

    const start = Date.now();
    const [authEdgeConfig, featureFlags] = await Promise.all([
      getAuthEdgeConfig(domain),
      getFeatureFlags(domain),
    ]);

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

        return (
          withBasicTokenAnonymous(
            authEdgeConfig,
            addLeadingSlash(node.slug)
          ) === Gate.DENY
        );
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
      unindexable: response.tooLarge.length,
    });

    response.tooLarge.forEach(({ record, size }) => {
      console.warn(
        `Could not index record because it was too large: https://${record.domain}${record.pathname}${record.hash ?? ""} (${String(size)} bytes)`
      );
    });

    return res.status(200).json({
      added: response.addedObjectIDs.length,
      updated: response.updatedObjectIDs.length,
      deleted: response.deletedObjectIDs.length,
      unindexable: response.tooLarge.length,
    });
  } catch (error) {
    console.error(error);

    await track("algolia_reindex_error", {
      indexName: SEARCH_INDEX,
      domain,
      error: String(error),
    });

    return res.status(500).send("Internal server error");
  }
}
