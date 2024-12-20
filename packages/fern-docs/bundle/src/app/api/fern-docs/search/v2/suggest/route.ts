import { track } from "@/server/analytics/posthog";
import { algoliaAppId, anthropicApiKey } from "@/server/env-variables";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { createAnthropic } from "@ai-sdk/anthropic";
import { searchClient } from "@algolia/client-search";
import { getFeatureFlags } from "@fern-docs/edge-config";
import { SuggestionsSchema } from "@fern-docs/search-server";
import {
  SEARCH_INDEX,
  type AlgoliaRecord,
} from "@fern-docs/search-server/algolia";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";
import { kv } from "@vercel/kv";
import { streamObject } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const DEPLOYMENT_ID = process.env.VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BodySchema = z.object({
  algoliaSearchKey: z.string(),
});

export async function POST(req: NextRequest): Promise<Response> {
  const anthropic = createAnthropic({ apiKey: anthropicApiKey() });
  const languageModel = anthropic.languageModel("claude-3-5-haiku-latest");

  const start = Date.now();
  const domain = getDocsDomainEdge(req);
  const featureFlags = await getFeatureFlags(domain);

  if (!featureFlags.isAskAiEnabled) {
    throw new Error(`Ask AI is not enabled for ${domain}`);
  }

  const cacheKey = `${PREFIX}:${domain}:suggestions`;
  if (!req.cookies.has(COOKIE_FERN_TOKEN)) {
    const cachedSuggestions = await kv.get(cacheKey);

    if (cachedSuggestions) {
      return NextResponse.json(cachedSuggestions, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  }

  const body = await req.json();
  const { algoliaSearchKey } = BodySchema.parse(body);

  const client = searchClient(algoliaAppId(), algoliaSearchKey);
  const response = await client.searchSingleIndex<AlgoliaRecord>({
    indexName: SEARCH_INDEX,
    searchParams: {
      query: "",
      hitsPerPage: 50,
      attributesToSnippet: [],
      attributesToHighlight: [],
    },
  });

  const result = streamObject({
    model: languageModel,
    system:
      "You are a helpful assistant that suggestions of questions for the user to ask about the documentation. Generate 5 questions based on the following search results.",
    prompt: response.hits
      .map(
        (hit) =>
          `# ${hit.title}\n${hit.description ?? ""}\n${hit.type === "changelog" || hit.type === "markdown" ? (hit.content ?? "") : ""}`
      )
      .join("\n\n"),
    maxRetries: 3,
    schema: SuggestionsSchema,
    onFinish: async (e) => {
      const end = Date.now();
      await track("ask_ai_suggestions", {
        languageModel: languageModel.modelId,
        durationMs: end - start,
        domain,
        indexName: SEARCH_INDEX,
        ...e.usage,
      });
      e.warnings?.forEach((warning) => {
        console.warn(warning);
      });
      if (e.object && !req.cookies.has(COOKIE_FERN_TOKEN)) {
        await kv.set(cacheKey, e.object);
        await kv.expire(cacheKey, 60 * 60);
      }
    },
  });

  return result.toTextStreamResponse();
}
