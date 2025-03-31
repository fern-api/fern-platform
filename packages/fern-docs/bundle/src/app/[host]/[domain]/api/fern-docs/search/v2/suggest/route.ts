import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { searchClient } from "@algolia/client-search";
import { getEnv } from "@vercel/functions";
import { kv } from "@vercel/kv";
import { streamObject } from "ai";
import { z } from "zod";

import { getEdgeFlags } from "@fern-docs/edge-config";
import { SuggestionsSchema } from "@fern-docs/search-server";
import {
  type AlgoliaRecord,
  SEARCH_INDEX,
} from "@fern-docs/search-server/algolia";
import { COOKIE_FERN_TOKEN } from "@fern-docs/utils";

import { track } from "@/server/analytics/posthog";
import { algoliaAppId } from "@/server/env-variables";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

const DEPLOYMENT_ID = getEnv().VERCEL_DEPLOYMENT_ID ?? "development";
const PREFIX = `docs:${DEPLOYMENT_ID}`;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BodySchema = z.object({
  algoliaSearchKey: z.string(),
});

export async function POST(req: NextRequest): Promise<Response> {
  const bedrock = createAmazonBedrock({
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });
  const languageModel = bedrock("us.anthropic.claude-3-5-haiku-20241022-v1:0");

  const start = Date.now();
  const domain = getDocsDomainEdge(req);
  const edgeFlags = await getEdgeFlags(domain);
  const cookieJar = await cookies();

  if (!edgeFlags.isAskAiEnabled) {
    throw new Error(`Ask AI is not enabled for ${domain}`);
  }

  const cacheKey = `${PREFIX}:${domain}:suggestions`;
  if (!cookieJar.has(COOKIE_FERN_TOKEN)) {
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
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
      functionId: "ask_ai_suggest",
      metadata: {
        domain,
        indexName: SEARCH_INDEX,
        languageModel: languageModel.modelId,
      },
    },
    onFinish: async (e) => {
      const end = Date.now();
      track("ask_ai_suggestions", {
        languageModel: languageModel.modelId,
        durationMs: end - start,
        domain,
        indexName: SEARCH_INDEX,
        ...e.usage,
      });
      e.warnings?.forEach((warning) => {
        console.warn(warning);
      });
      if (e.object && !cookieJar.has(COOKIE_FERN_TOKEN)) {
        await kv.set(cacheKey, e.object);
        await kv.expire(cacheKey, 60 * 60);
      }
    },
  });

  return result.toTextStreamResponse();
}
