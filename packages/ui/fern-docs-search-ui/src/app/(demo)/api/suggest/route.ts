import { algoliaAppId } from "@/server/env-variables";
import { models } from "@/server/models";
import { SuggestionsSchema } from "@/server/suggestions-schema";
import { searchClient } from "@algolia/client-search";
import { SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { streamObject } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BodySchema = z.object({
    algoliaSearchKey: z.string(),
    model: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
    const { algoliaSearchKey, model: _model } = BodySchema.parse(await request.json());

    const model = models[(_model as keyof typeof models) ?? "gpt-4o-mini"];

    if (!algoliaSearchKey || typeof algoliaSearchKey !== "string") {
        return new Response("Missing search key", { status: 400 });
    }

    const client = searchClient(algoliaAppId(), algoliaSearchKey);
    const response = await client.searchSingleIndex<AlgoliaRecord>({
        indexName: SEARCH_INDEX,
        searchParams: { query: "", hitsPerPage: 100, attributesToSnippet: [] },
    });

    const result = await streamObject({
        model,
        system: "You are a helpful assistant that suggestions of questions for the user to ask about the documentation. Generate 5 questions based on the following search results.",
        prompt: response.hits
            .map(
                (hit) =>
                    `# ${hit.title}\n${hit.description ?? ""}\n${hit.type === "changelog" || hit.type === "markdown" ? hit.content ?? "" : ""}`,
            )
            .join("\n\n"),
        maxRetries: 3,
        schema: SuggestionsSchema,
    });

    return result.toTextStreamResponse();
}
