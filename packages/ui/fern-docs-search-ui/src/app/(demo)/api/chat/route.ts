import { DEFAULT_SYSTEM_PROMPT } from "@/components/chatbot/system-prompt";
import { algoliaAppId } from "@/server/env-variables";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createCohere } from "@ai-sdk/cohere";
import { createOpenAI } from "@ai-sdk/openai";
import { searchClient } from "@algolia/client-search";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { streamText, tool } from "ai";
import { z } from "zod";

const anthropic = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
const cohere = createCohere({
    apiKey: process.env.COHERE_API_KEY,
});

const models = {
    "gpt-4o": openai.languageModel("gpt-4o"),
    "gpt-4o-mini": openai.languageModel("gpt-4o-mini"),
    "command-r-plus": cohere.languageModel("command-r-plus"),
    "command-r": cohere.languageModel("command-r"),
    "claude-3-opus": anthropic.languageModel("claude-3-opus-latest"),
    "claude-3-5-sonnet": anthropic.languageModel("claude-3-5-sonnet-latest"),
    "claude-3-5-haiku": anthropic.languageModel("claude-3-5-haiku-latest"),
} as const;

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
    const modelId = request.headers.get("X-Fern-Docs-Model");
    const searchKey = request.headers.get("X-Algolia-Search-Key");
    const userToken = request.headers.get("X-User-Token") ?? undefined;

    if (!modelId) {
        return new Response("Model is required", { status: 400 });
    }

    const model = models[modelId as keyof typeof models];

    if (!model) {
        return new Response(`Invalid model: ${modelId}`, { status: 400 });
    }

    const { messages, system: _system } = await request.json();

    const system = typeof _system === "string" ? _system.trim() + "\n" : DEFAULT_SYSTEM_PROMPT;

    const result = await streamText({
        model,
        system,
        messages,
        maxSteps: 10,
        maxRetries: 3,
        tools: {
            search: tool({
                description: "knowledge base search. If no results are found, try again with a more general query.",
                parameters: z.object({
                    query: z
                        .string()
                        .describe("the search terms to use. Only use keywords. Never use full sentences or questions."),
                }),
                async execute({ query }) {
                    if (!searchKey) {
                        return [];
                    }

                    const client = searchClient(algoliaAppId(), searchKey);
                    const response = await client.searchSingleIndex<AlgoliaRecord>({
                        indexName: "fern-docs-search",
                        searchParams: { query, userToken, hitsPerPage: 10 },
                    });

                    return response.hits.map(({ domain, pathname, hash, canonicalPathname, ...other }) => {
                        const url = `https://${domain}${pathname}${hash ?? ""}`;
                        return { url, ...other };
                    });
                },
            }),
        },
    });

    return result.toDataStreamResponse({});
}
