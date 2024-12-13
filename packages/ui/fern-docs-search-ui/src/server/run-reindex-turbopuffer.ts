import { createOpenAI } from "@ai-sdk/openai";
import {
    FernTurbopufferRecord,
    semanticSearch,
    turbopufferUpsertTask,
} from "@fern-ui/fern-docs-search-server/turbopuffer";
import { embed, embedMany } from "ai";
import { fdrEnvironment, fernToken, turbopufferApiKey } from "./env-variables";

const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const runReindexTurbopuffer = async (domain: string): Promise<number> => {
    return turbopufferUpsertTask({
        apiKey: turbopufferApiKey(),
        namespace: domain,
        payload: {
            environment: fdrEnvironment(),
            fernToken: fernToken(),
            domain,
        },
        vectorizer: async (chunks) => {
            const embeddings = await embedMany({
                model: openai.embedding("text-embedding-3-small"),
                values: chunks,
            });
            return embeddings.embeddings;
        },
    });
};

export const runSemanticSearchTurbopuffer = async (
    query: string,
    domain: string,
    topK: number = 10,
): Promise<FernTurbopufferRecord[]> => {
    return semanticSearch(query, {
        namespace: domain,
        apiKey: turbopufferApiKey(),
        topK,
        vectorizer: async (text) => {
            const embedding = await embed({
                model: openai.embedding("text-embedding-3-small"),
                value: text,
            });
            return embedding.embedding;
        },
    });
};
