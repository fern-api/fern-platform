import { algoliaAppId } from "@/server/env-variables";
import { models } from "@/server/models";
import { runSemanticSearchTurbopuffer } from "@/server/run-reindex-turbopuffer";
import { createDefaultSystemPrompt } from "@/server/system-prompt";
import { searchClient } from "@algolia/client-search";
import { AlgoliaRecord, SEARCH_INDEX } from "@fern-ui/fern-docs-search-server/algolia";
import { toDocuments } from "@fern-ui/fern-docs-search-server/turbopuffer";
import { streamText, tool } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const BodySchema = z.object({
    messages: z.array(z.any()),
    algoliaSearchKey: z.string(),
    model: z.string().optional(),
    domain: z.string(),
});

export async function POST(request: Request): Promise<Response> {
    const { messages, model: _model, domain, algoliaSearchKey } = BodySchema.parse(await request.json());

    const model = models[(_model as keyof typeof models) ?? "gpt-4o-mini"];

    const lastUserMessage = messages.findLast((message) => message.role === "user")?.content;

    const searchResults = await runSemanticSearchTurbopuffer(lastUserMessage ?? "", domain, 10);
    const documents = toDocuments(searchResults).join("\n\n");

    const system = createDefaultSystemPrompt({ domain, date: new Date().toDateString(), documents });

    const result = streamText({
        model,
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
                    const response = await runSemanticSearchTurbopuffer(query, domain, 20);
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
    });

    return result.toDataStreamResponse({});
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
