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

const system = `You are an AI RAG assistant.
ONLY respond to questions using information from the knowledge base search tool.
Do not rely on your own knowledge.
Include links to the relevant pages in your responses.
If no relevant information is found in the tool calls, respond, "Sorry, I don't know."
Keep responses short and concise. Always use markdown formatting, and always include markdown footnotes with links to the relevant pages.
Use [^1] for inline annotations, and then provide the URL in the footnote like this:
[^1]: https://<docs-url>/<path>
If a footnote is added to the end of a code block, it should be preceded by a blank line.
Do not refer to the user as "the user", just respond to the user's question in the first person.
`;

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

    const { messages } = await request.json();

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
