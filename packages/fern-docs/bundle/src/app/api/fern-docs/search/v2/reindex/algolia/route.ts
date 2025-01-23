import { track } from "@/server/analytics/posthog";
import { DocsLoaderImpl } from "@/server/DocsLoaderImpl";
import { algoliaAppId, algoliaWriteApiKey } from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { getAuthEdgeConfig } from "@fern-docs/edge-config";
import {
  SEARCH_INDEX,
  algoliaIndexSettingsTask,
  algoliaIndexerTask,
} from "@fern-docs/search-server/algolia";
import { addLeadingSlash } from "@fern-docs/utils";
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 900; // 15 minutes
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);

  try {
    const loader = DocsLoaderImpl.for(domain, host);
    const orgMetadata = await loader.getMetadata();
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
    const authEdgeConfig = await getAuthEdgeConfig(domain);

    await algoliaIndexSettingsTask({
      appId: algoliaAppId(),
      writeApiKey: algoliaWriteApiKey(),
      indexName: SEARCH_INDEX,
    });

    const response = await algoliaIndexerTask({
      appId: algoliaAppId(),
      writeApiKey: algoliaWriteApiKey(),
      indexName: SEARCH_INDEX,
      loader,
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
