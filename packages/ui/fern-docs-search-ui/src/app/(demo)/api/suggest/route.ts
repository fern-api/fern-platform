import { algoliaAppId } from "@/server/env-variables";
import { models } from "@/server/models";
import { SuggestionsSchema } from "@/server/suggestions-schema";
import { searchClient } from "@algolia/client-search";
import { SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { streamObject } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: Request): Promise<Response> {
    const searchKey = request.headers.get("X-Algolia-Search-Key");
    const userToken = request.headers.get("X-User-Token") ?? undefined;
    const model = models["gpt-4o-mini"];

    if (!searchKey) {
        return new Response("Missing search key", { status: 400 });
    }

    const client = searchClient(algoliaAppId(), searchKey);
    const response = await client.searchSingleIndex<AlgoliaRecord>({
        indexName: SEARCH_INDEX,
        searchParams: { query: "", userToken, hitsPerPage: 100, attributesToSnippet: [] },
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
