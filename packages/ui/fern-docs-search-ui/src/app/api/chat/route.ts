import { algoliaAppId, algoliaWriteApiKey } from "@/server/env-variables";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createCohere } from "@ai-sdk/cohere";
import { createOpenAI } from "@ai-sdk/openai";
import { createSearchFilters } from "@fern-ui/fern-docs-search-server/algolia";
import { AlgoliaRecord } from "@fern-ui/fern-docs-search-server/types";
import { StreamData, streamText, tool } from "ai";
import { Hit, algoliasearch } from "algoliasearch";
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

const system = `You are a helpful assistant acting as the users' second brain.
Use tools on every request.
Be sure to search your knowledge base before answering any questions.
ONLY respond to questions using information from tool calls.
If no relevant information is found in the tool calls, respond, "Sorry, I don't know."
Do not make up answers or make assumptions beyond the info provided in the tool calls.
Keep responses short and concise. Answer in a single sentence where possible.
If you are unsure, use the getInformation tool and you can use common sense to reason based on the information you do have.
Use your abilities as a reasoning machine to answer questions based on the information you do have.`;

export async function POST(request: Request): Promise<Response> {
    const domain = request.headers.get("X-Fern-Docs-Domain");
    const modelId = request.headers.get("X-Fern-Docs-Model");

    if (!domain) {
        return new Response("Domain is required", { status: 400 });
    }

    if (!modelId) {
        return new Response("Model is required", { status: 400 });
    }

    const model = models[modelId as keyof typeof models];

    if (!model) {
        return new Response(`Invalid model: ${modelId}`, { status: 400 });
    }

    const { messages } = await request.json();

    const data = new StreamData();

    const allHits: Map<string, Hit<AlgoliaRecord>> = new Map();

    const result = await streamText({
        model,
        system,
        messages,
        maxSteps: 10,
        maxRetries: 3,
        tools: {
            bm25search: tool({
                description: "query the knowledge base's search index",
                parameters: z.object({
                    query: z
                        .string()
                        .describe(
                            "the search terms to use. Only use keywords. Do not use full sentences or questions.",
                        ),
                }),
                async execute({ query }) {
                    const client = algoliasearch(algoliaAppId(), algoliaWriteApiKey());
                    const filters = createSearchFilters({ domain, roles: [], authed: false });
                    const { hits } = await client.browse<AlgoliaRecord>({
                        indexName: "fern-docs-search",
                        browseParams: { query, filters },
                    });
                    hits.forEach((hit) => {
                        allHits.set(hit.objectID, hit);
                    });
                    return hits.map(toContent);
                },
            }),
        },
        //         onFinish: async ({ text }) => {
        //             const records: string[] = [];

        //             for (const { objectID, ...hit } of allHits.values()) {
        //                 records.push(`${objectID}, ${JSON.stringify(toContent(hit))}`);
        //             }

        //             const { object } = await generateObject({
        //                 model,
        //                 system: "You are a reference extractor.",
        //                 schema: z.object({
        //                     relevantObjectIDs: z
        //                         .array(z.string())
        //                         .describe("the objectIDs of the hits that are relevant to the text"),
        //                 }),
        //                 prompt: `Is the following reference relevant to the text?

        // ## Text
        // ${text}

        // ## Records
        // ObjectID, Record
        // ${records.join("\n")}`,
        //             });

        //             object.relevantObjectIDs.forEach((objectID) => {
        //                 const hit = allHits.get(objectID);
        //                 if (hit) {
        //                     data.append({
        //                         type: "reference",
        //                         title: hit.title,
        //                         path: `${hit.pathname}${hit.hash ?? ""}`,
        //                     });
        //                 }
        //             });
        //             await data.close();
        //         },
    });

    return result.toDataStreamResponse({ data });
}

function toContent(hit: Partial<Hit<AlgoliaRecord>>): Record<string, unknown> {
    return JSON.parse(
        JSON.stringify({
            type: hit.type,
            title: hit.title,
            description: hit.description,
            content: hit.type === "markdown" || hit.type === "changelog" ? hit.content : null,
            code_snippets: hit.code_snippets,
            date: hit.type === "changelog" ? hit.date : null,
            api_type: hit.type === "api-reference" ? hit.api_type : null,
            method: hit.type === "api-reference" ? hit.method : null,
            endpoint_path: hit.type === "api-reference" ? hit.endpoint_path : null,
            payload_description: hit.type === "api-reference" ? hit.payload_description : null,
            request_description: hit.type === "api-reference" ? hit.request_description : null,
            response_description: hit.type === "api-reference" ? hit.response_description : null,
        }),
    );
}
