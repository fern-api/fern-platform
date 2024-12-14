import { createAnthropic } from "@ai-sdk/anthropic";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { queryTurbopuffer, toDocuments } from "@fern-ui/fern-docs-search-server/turbopuffer";
import { createDefaultSystemPrompt } from "@fern-ui/fern-docs-search-ui";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-ui/fern-docs-utils";
import { embed, streamText, tool } from "ai";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";

import { track } from "@/server/analytics/posthog";
import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { anthropicApiKey, openaiApiKey, turbopufferApiKey } from "@/server/env-variables";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { createOpenAI } from "@ai-sdk/openai";

const anthropic = createAnthropic({ apiKey: anthropicApiKey() });
const languageModel = anthropic.languageModel("claude-3-5-sonnet-latest");

const openai = createOpenAI({
    apiKey: openaiApiKey(),
});

const embeddingModel = openai.embedding("text-embedding-3-small");

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const domain = getDocsDomainNode(req);
    const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;
    const messages = req.body.messages;

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
    const [authEdgeConfig, featureFlags] = await Promise.all([getAuthEdgeConfig(domain), getFeatureFlags(domain)]);

    if (!featureFlags.isAskAiEnabled) {
        throw new Error(`Ask AI is not enabled for ${domain}`);
    }

    const fern_token = req.cookies[COOKIE_FERN_TOKEN];
    const user = await safeVerifyFernJWTConfig(fern_token, authEdgeConfig);

    const lastUserMessage: string | undefined = messages.findLast((message: any) => message.role === "user")?.content;

    const searchResults = await runQueryTurbopuffer(lastUserMessage, {
        namespace,
        authed: user != null,
        roles: user?.roles ?? [],
    });
    const documents = toDocuments(searchResults).join("\n\n");
    const system = createDefaultSystemPrompt({ domain, date: new Date().toDateString(), documents });

    const result = streamText({
        model: languageModel,
        system,
        messages,
        maxSteps: 10,
        maxRetries: 3,
        tools: {
            search: tool({
                description: "Search the knowledge base for the user's query. Semantic search is enabled.",
                parameters: z.object({
                    query: z.string(),
                }),
                async execute({ query }) {
                    const response = await runQueryTurbopuffer(query, {
                        namespace,
                        authed: user != null,
                        roles: user?.roles ?? [],
                    });
                    return response.map((hit) => {
                        const { domain, pathname, hash } = hit.attributes;
                        const url = `https://${domain}${pathname}${hash ?? ""}`;
                        return { url, ...hit.attributes };
                    });
                },
            }),
        },
        onFinish: async (e) => {
            const end = Date.now();
            await track("ask_ai", {
                languageModel: languageModel.modelId,
                embeddingModel: embeddingModel.modelId,
                durationMs: end - start,
                domain,
                namespace,
                numToolCalls: e.toolCalls.length,
                finishReason: e.finishReason,
                ...e.usage,
            });
            e.warnings?.forEach((warning) => {
                // eslint-disable-next-line no-console
                console.warn(warning);
            });
        },
    });

    return result.pipeDataStreamToResponse(res);
}

async function runQueryTurbopuffer(
    query: string | null | undefined,
    opts: {
        namespace: string;
        topK?: number;
        authed?: boolean;
        roles?: string[];
    },
) {
    return query == null || query.trimStart().length === 0
        ? []
        : await queryTurbopuffer(query, {
              namespace: opts.namespace,
              apiKey: turbopufferApiKey(),
              topK: opts.topK ?? 20,
              vectorizer: async (text) => {
                  const embedding = await embed({
                      model: embeddingModel,
                      value: text,
                  });
                  return embedding.embedding;
              },
              authed: opts.authed,
              roles: opts.roles,
          });
}
