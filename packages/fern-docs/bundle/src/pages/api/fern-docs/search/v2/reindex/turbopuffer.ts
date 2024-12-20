import { createOpenAI } from "@ai-sdk/openai";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-docs/edge-config";
import { turbopufferUpsertTask } from "@fern-docs/search-server/turbopuffer";
import { addLeadingSlash, withoutStaging } from "@fern-docs/utils";
import { embedMany } from "ai";
import { NextApiRequest, NextApiResponse } from "next/types";

import { track } from "@/server/analytics/posthog";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import {
  fdrEnvironment,
  fernToken,
  openaiApiKey,
  turbopufferApiKey,
} from "@/server/env-variables";
import { Gate, withBasicTokenAnonymous } from "@/server/withRbac";
import { getDocsDomainNode } from "@/server/xfernhost/node";

const openai = createOpenAI({
  apiKey: openaiApiKey(),
});

const embeddingModel = openai.embedding("text-embedding-3-small");

export const maxDuration = 900; // 15 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const domain = getDocsDomainNode(req);
  const deleteExisting = req.query.deleteExisting === "true";
  const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;

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

    if (!featureFlags.isAskAiEnabled) {
      throw new Error(`AI Chat is not enabled for ${domain}`);
    }

    const numInserted = await turbopufferUpsertTask({
      apiKey: turbopufferApiKey(),
      namespace,
      payload: {
        environment: fdrEnvironment(),
        fernToken: fernToken(),
        domain: withoutStaging(domain),
        ...featureFlags,
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

    return res.status(200).json({
      added: numInserted,
    });
  } catch (error) {
    console.error(error);

    await track("turbopuffer_reindex_error", {
      embeddingModel: embeddingModel.modelId,
      domain,
      namespace,
      error: String(error),
    });

    return res.status(500).send("Internal server error");
  }
}
