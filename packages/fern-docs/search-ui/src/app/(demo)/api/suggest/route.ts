import { SuggestionsSchema } from "@fern-docs/search-server";
import { TrieveSDK } from "trieve-ts-sdk";
import { z } from "zod";

const BodySchema = z.object({
  apiKey: z.string(),
  datasetId: z.string(),
});

export async function POST(request: Request): Promise<Response> {
  const { apiKey, datasetId } = BodySchema.parse(await request.json());

  const client = new TrieveSDK({
    apiKey,
    datasetId,
  });
  const suggestions = SuggestionsSchema.parse({
    suggestions: [],
  });

  try {
    const suggestedQueriesResult = await client.suggestedQueries({
      suggestion_type: "question",
    });
    suggestions.suggestions = suggestedQueriesResult.queries.slice(0, 5);
  } catch (e) {
    console.error("error getting suggestions from trieve", e);
  }

  return new Response(JSON.stringify(suggestions), {
    headers: { "Content-Type": "application/json" },
  });
}
