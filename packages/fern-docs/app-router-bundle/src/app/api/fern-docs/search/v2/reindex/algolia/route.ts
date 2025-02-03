import { track } from "@/server/analytics/posthog";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
  algoliaAppId,
  algoliaWriteApiKey,
  fdrEnvironment,
  fernToken,
} from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  SEARCH_INDEX,
  algoliaIndexSettingsTask,
  algoliaIndexerTask,
} from "@fern-docs/search-server/algolia";
import { addLeadingSlash, withoutStaging } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 900; // 15 minutes
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);

  try {
    const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
    if (orgMetadata == null) {
      return NextResponse.json("Not found", { status: 404 });
    }

    // If the domain is a preview URL, we don't want to reindex
    if (orgMetadata.isPreviewUrl) {
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
      ...edgeFlags,
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

    return NextResponse.json({
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

    return NextResponse.json("Internal server error", { status: 500 });
  }
}
