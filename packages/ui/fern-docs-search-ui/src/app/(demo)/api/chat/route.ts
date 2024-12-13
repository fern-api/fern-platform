import { createDefaultSystemPrompt } from "@/components/chatbot/system-prompt";
import { models } from "@/server/models";
import { runSemanticSearchTurbopuffer } from "@/server/run-reindex-turbopuffer";
import { streamText, tool } from "ai";
import { uniqBy, zipWith } from "es-toolkit/array";
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
    const { messages, model: _model, domain } = BodySchema.parse(await request.json());

    const model = models[(_model as keyof typeof models) ?? "gpt-4o-mini"];

    const lastUserMessage = messages.findLast((message) => message.role === "user")?.content;

    const searchResults = (await runSemanticSearchTurbopuffer(lastUserMessage ?? "", domain, 20)).map((result) => {
        const code_snippets = zipWith(
            result.attributes.code_snippets ?? [],
            result.attributes.code_snippet_langs ?? [],
            (snippet, lang) => {
                const lang_str: string = lang ?? "";
                return `\`\`\`${lang_str}\n${snippet}\n\`\`\``;
            },
        ).join("\n\n");
        return {
            canonicalPathname: result.attributes.canonicalPathname,
            domain: result.attributes.domain,
            pathname: result.attributes.pathname,
            hash: result.attributes.hash,
            title: result.attributes.title,
            description: result.attributes.description ? result.attributes.description + "\n\n" : "",
            content: result.attributes.content ? result.attributes.content + "\n\n" : "",
            code_snippets: code_snippets ? code_snippets + "\n\n" : "",
            page_position: result.attributes.page_position,
        };
    });

    const documents = uniqBy(searchResults, (result) => `${result.pathname}${result.hash} - ${result.page_position}`)
        .map(
            (result) =>
                `# ${result.title}\n Source: ${result.domain}${result.pathname}${result.hash ?? ""}\n\n${result.description}${result.content}${result.code_snippets}`,
        )
        .join("\n\n");

    const system = createDefaultSystemPrompt({ domain, date: new Date().toDateString(), documents });

    const result = await streamText({
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
                    const response = await runSemanticSearchTurbopuffer(query, domain);
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
