import { models } from "@/server/models";
import { runSemanticSearchTurbopuffer } from "@/server/run-reindex-turbopuffer";
import { createDefaultSystemPrompt } from "@/server/system-prompt";
import { toDocuments } from "@fern-docs/search-server/turbopuffer";
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
    const {
        messages,
        model: _model,
        domain,
    } = BodySchema.parse(await request.json());

    const model = models[(_model as keyof typeof models) ?? "gpt-4o-mini"];

    const lastUserMessage = messages.findLast(
        (message) => message.role === "user"
    )?.content;

    const searchResults = await runSemanticSearchTurbopuffer(
        lastUserMessage ?? "",
        domain,
        20
    );
    const documents = toDocuments(searchResults).join("\n\n");

    const system = createDefaultSystemPrompt({
        domain,
        date: new Date().toDateString(),
        documents,
    });

    const result = streamText({
        model,
        system,
        messages,
        maxSteps: 10,
        maxRetries: 3,
        tools: {
            search: tool({
                description:
                    "Search the knowledge base for the user's query. Semantic search is enabled.",
                parameters: z.object({
                    query: z.string(),
                }),
                async execute({ query }) {
                    const response = await runSemanticSearchTurbopuffer(
                        query,
                        domain
                    );
                    return response.map((hit) => {
                        const { domain, pathname, hash } = hit.attributes;
                        const url = `https://${domain}${pathname}${hash ?? ""}`;
                        return { url, ...hit.attributes };
                    });
                },
            }),
        },
    });

    return result.toDataStreamResponse({});
}
