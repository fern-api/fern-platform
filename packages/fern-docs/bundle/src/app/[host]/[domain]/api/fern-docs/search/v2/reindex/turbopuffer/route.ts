import { NextRequest, NextResponse } from "next/server";

import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";

import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { turbopufferUpsertTask } from "@fern-docs/search-server/turbopuffer";
import { slugToHref, withoutStaging } from "@fern-docs/utils";

import { track } from "@/server/analytics/posthog";
import { createCachedDocsLoader } from "@/server/docs-loader";
import {
  fdrEnvironment,
  fernToken_admin,
  openaiApiKey,
  turbopufferApiKey,
} from "@/server/env-variables";
import { postToEngineeringNotifs } from "@/server/slack";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const maxDuration = 800; // 13 minutes

export async function GET(req: NextRequest): Promise<NextResponse> {
  const openai = createOpenAI({ apiKey: openaiApiKey() });
  const embeddingModel = openai.embedding("text-embedding-3-large");

  const host = req.nextUrl.host;
  const domain = getDocsDomainEdge(req);
  const deleteExisting =
    req.nextUrl.searchParams.get("deleteExisting") === "true";
  const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;

  try {
    const loader = await createCachedDocsLoader(host, domain);
    const metadata = await loader.getMetadata();
    if (metadata == null) {
      return NextResponse.json("Not found", { status: 404 });
    }

    // If the domain is a preview URL, we don't want to reindex
    if (metadata.isPreview) {
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
          withBasicTokenAnonymous(authEdgeConfig, slugToHref(node.slug)) ===
          Gate.DENY
        );
      },
      deleteExisting,
    });

    const end = Date.now();

    track("turbopuffer_reindex", {
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

    track("turbopuffer_reindex_error", {
      embeddingModel: embeddingModel.modelId,
      domain,
      namespace,
      error: String(error),
    });

    postToEngineeringNotifs(
      `:rotating_light: [TURBOPUFFER] Failed to reindex ${domain} with the following error: ${String(error)}`,
      "turbopuffer-reindex"
    );

    return NextResponse.json("Internal server error", { status: 500 });
  }
}
