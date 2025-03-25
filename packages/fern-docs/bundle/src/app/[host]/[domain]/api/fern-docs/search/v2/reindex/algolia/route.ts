import { NextRequest, NextResponse } from "next/server";

import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  SEARCH_INDEX,
  algoliaIndexSettingsTask,
  algoliaIndexerTask,
} from "@fern-docs/search-server/algolia";
import { slugToHref, withoutStaging } from "@fern-docs/utils";

import { track } from "@/server/analytics/posthog";
import { createCachedDocsLoader } from "@/server/docs-loader";
import {
  algoliaAppId,
  algoliaWriteApiKey,
  fdrEnvironment,
  fernToken_admin,
} from "@/server/env-variables";
import { postToEngineeringNotifs } from "@/server/slack";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const maxDuration = 800; // 13 minutes

export async function GET(req: NextRequest): Promise<NextResponse> {
  const host = req.nextUrl.host;
  const domain = getDocsDomainEdge(req);

  try {
    const loader = await createCachedDocsLoader(host, domain);
    const metadata = await loader.getMetadata();
    if (metadata == null) {
      return NextResponse.json("Not found", { status: 404 });
    }

    // If the domain is a preview URL, we don't want to reindex
    if (metadata.isPreview) {
      return NextResponse.json({
        added: 0,
        updated: 0,
        deleted: 0,
        unindexable: 0,
      });
    }

    const start = Date.now();
    const [authEdgeConfig, edgeFlags] = await Promise.all([
      getAuthEdgeConfig(domain),
      getEdgeFlags(domain),
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
      fernToken: fernToken_admin(),
      domain: withoutStaging(domain),
      authed: (node) => {
        if (authEdgeConfig == null) {
          return false;
        }

        return (
          withBasicTokenAnonymous(authEdgeConfig, slugToHref(node.slug)) ===
          Gate.DENY
        );
      },
      ...edgeFlags,
    });

    const end = Date.now();

    track("algolia_reindex", {
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

    return NextResponse.json({
      added: response.addedObjectIDs.length,
      updated: response.updatedObjectIDs.length,
      deleted: response.deletedObjectIDs.length,
      unindexable: response.tooLarge.length,
    });
  } catch (error) {
    console.error(error);

    track("algolia_reindex_error", {
      indexName: SEARCH_INDEX,
      domain,
      error: String(error),
    });

    postToEngineeringNotifs(
      `:rotating_light: [ALGOLIA] Failed to reindex ${domain} with the following error: ${String(error)}`,
      "algolia-reindex"
    );

    return NextResponse.json("Internal server error", { status: 500 });
  }
}
