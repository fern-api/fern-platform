import { createAnthropic } from "@ai-sdk/anthropic";
import { getAuthEdgeConfig, getFeatureFlags } from "@fern-ui/fern-docs-edge-config";
import { queryTurbopuffer, toDocuments } from "@fern-ui/fern-docs-search-server/turbopuffer";
import { SEARCH_INDEX, createDefaultSystemPrompt } from "@fern-ui/fern-docs-search-ui";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-ui/fern-docs-utils";
import { embed, streamText, tool } from "ai";
import { NextApiRequest, NextApiResponse } from "next/types";
import { z } from "zod";

import { track } from "@/server/analytics/posthog";
import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { algoliaAppId, anthropicApiKey, openaiApiKey, turbopufferApiKey } from "@/server/env-variables";
import { getDocsDomainNode } from "@/server/xfernhost/node";
import { createOpenAI } from "@ai-sdk/openai";
import { searchClient } from "@algolia/client-search";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/algolia/types";

const anthropic = createAnthropic({ apiKey: anthropicApiKey() });
const languageModel = anthropic.languageModel("claude-3-5-sonnet-latest");

const openai = createOpenAI({
    apiKey: openaiApiKey(),
});

const embeddingModel = openai.embedding("text-embedding-3-small");

const BodySchema = z.object({
    algoliaSearchKey: z.string(),
    messages: z.array(z.any()),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse): Promise<void> {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).send(`Method ${req.method} Not Allowed`);
    }

    const domain = getDocsDomainNode(req);
    const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;
    const { algoliaSearchKey, messages } = BodySchema.parse(req.body);

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

            searchChangelogs: tool({
                description:
                    "Query the changelog for the user's query using BM25 for the first 10 results, sorted by descending order",
                parameters: z.object({
                    query: z.string().optional().describe("If not provided, all changelogs will be returned"),
                    startDate: z
                        .string()
                        .date()
                        .optional()
                        .describe("If provided, only changelogs on or after this date will be returned"),
                    endDate: z
                        .string()
                        .date()
                        .optional()
                        .describe("If provided, only changelogs on or before this date will be returned"),
                    page: z.number().optional().describe("The page number to return, starting from 0"),
                }),
                async execute({ query = "", startDate, endDate, page = 0 }) {
                    const client = searchClient(algoliaAppId(), algoliaSearchKey);
                    const dateFilter = getAlgoliaDateFilter(
                        startDate ? new Date(startDate) : undefined,
                        endDate ? new Date(endDate) : undefined,
                    );
                    const response = await client.searchSingleIndex<AlgoliaRecord>({
                        indexName: SEARCH_INDEX,
                        searchParams: {
                            query,
                            hitsPerPage: 10,
                            page,
                            attributesToHighlight: [],
                            attributesToSnippet: [],
                            restrictHighlightAndSnippetArrays: true,
                            filters: dateFilter ? `type:changelog AND ${dateFilter}` : "type:changelog",
                            distinct: true,
                        },
                    });
                    return response.hits.map((hit) => ({
                        ...hit,
                        url: `https://${hit.domain}${hit.pathname}${hit.hash ?? ""}`,
                    }));
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
              mode: "hybrid",
          });
}

function getAlgoliaDateFilter(startDate?: Date, endDate?: Date): string | undefined {
    if (startDate && endDate) {
        return `date_timestamp:${toUnixTimestamp(startDate)} TO ${toUnixTimestamp(endDate)}`;
    }

    if (startDate) {
        return `date_timestamp >= ${toUnixTimestamp(startDate)}`;
    }

    if (endDate) {
        return `date_timestamp <= ${toUnixTimestamp(endDate)}`;
    }

    return undefined;
}

function toUnixTimestamp(date: Date) {
    return Math.floor(date.getTime() / 1000);
}
