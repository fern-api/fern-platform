import { algoliaAppId } from "@/server/env-variables";
import { models } from "@/server/models";
import { searchClient } from "@algolia/client-search";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
    const searchKey = request.headers.get("X-Algolia-Search-Key");
    const userToken = request.headers.get("X-User-Token") ?? undefined;

    const { messages, system: _system, model: _model } = await request.json();

    const model = models[(_model as keyof typeof models) ?? ""];

    if (!model) {
        return new Response(`Invalid model: ${_model}`, { status: 400 });
    }

    const system = typeof _system === "string" ? _system.trim() + "\n" : undefined;

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
                        searchParams: {
                            query,
                            userToken,
                            hitsPerPage: 20,
                            distinct: false,
                            decompoundQuery: true,
                            enableRules: true,
                            ignorePlurals: true,
                            attributesToSnippet: [],
                            attributesToHighlight: [],
                        },
                    });

                    return response.hits.map((hit) => {
                        const { domain, pathname, hash } = hit;
                        const url = `https://${domain}${pathname}${hash ?? ""}`;
                        return { url, ...hit };
                    });
                },
            }),
        },
    });

    return result.toDataStreamResponse({});
}
