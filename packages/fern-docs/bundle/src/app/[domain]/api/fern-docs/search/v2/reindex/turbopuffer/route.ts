import { createOpenAI } from "@ai-sdk/openai";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { turbopufferUpsertTask } from "@fern-docs/search-server/turbopuffer";
import { addLeadingSlash, withoutStaging } from "@fern-docs/utils";
import { embedMany } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { track } from "@/server/analytics/posthog";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
  fdrEnvironment,
  fernToken_admin,
  openaiApiKey,
  turbopufferApiKey,
} from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const maxDuration = 800; // 13 minutes

export async function GET(req: NextRequest): Promise<NextResponse> {
  const openai = createOpenAI({ apiKey: openaiApiKey() });
  const embeddingModel = openai.embedding("text-embedding-3-small");

  const domain = getDocsDomainEdge(req);
  const deleteExisting =
    req.nextUrl.searchParams.get("deleteExisting") === "true";
  const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;

  try {
    const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
    if (orgMetadata == null) {
      return NextResponse.json("Not found", { status: 404 });
    }

    // If the domain is a preview URL, we don't want to reindex
    if (orgMetadata.isPreviewUrl) {
      return NextResponse.json(
        {
          added: 0,
          updated: 0,
          deleted: 0,
          unindexable: 0,
        },
        { status: 200 }
      );
    }

    const start = Date.now();
    const [authEdgeConfig, edgeFlags] = await Promise.all([
      getAuthEdgeConfig(domain),
      getEdgeFlags(domain),
    ]);

    if (!edgeFlags.isAskAiEnabled) {
      throw new Error(`AI Chat is not enabled for ${domain}`);
    }

    const numInserted = await turbopufferUpsertTask({
      apiKey: turbopufferApiKey(),
      namespace,
      payload: {
        environment: fdrEnvironment(),
        fernToken: fernToken_admin(),
        domain: withoutStaging(domain),
        ...edgeFlags,
      },
      vectorizer: async (chunks) => {
        const embeddings = await embedMany({
          model: embeddingModel,
          values: chunks,
        });
        return embeddings.embeddings;
      },
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
      deleteExisting,
    });

    const end = Date.now();

    await track("turbopuffer_reindex", {
      embeddingModel: embeddingModel.modelId,
      durationMs: end - start,
      domain,
      namespace,
      added: numInserted,
    });

    return NextResponse.json(
      {
        added: numInserted,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);

    await track("turbopuffer_reindex_error", {
      embeddingModel: embeddingModel.modelId,
      domain,
      namespace,
      error: String(error),
    });

    return NextResponse.json("Internal server error", { status: 500 });
  }
}
