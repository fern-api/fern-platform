import { createOpenAI } from "@ai-sdk/openai";
import {
  FernTurbopufferRecord,
  queryTurbopuffer,
  turbopufferUpsertTask,
} from "@fern-docs/search-server/turbopuffer";
import { embed, embedMany } from "ai";
import { fdrEnvironment, fernToken, turbopufferApiKey } from "./env-variables";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = openai.embedding("text-embedding-3-small");

export const runReindexTurbopuffer = async (
  domain: string
): Promise<number> => {
  return turbopufferUpsertTask({
    apiKey: turbopufferApiKey(),
    namespace: `${domain}_${model.modelId}`,
    payload: {
      environment: fdrEnvironment(),
      fernToken: fernToken(),
      domain,
    },
    vectorizer: async (chunks) => {
      const embeddings = await embedMany({
        model,
        values: chunks,
      });
      return embeddings.embeddings;
    },
  });
};

export const runSemanticSearchTurbopuffer = async (
  query: string,
  domain: string,
  topK: number = 10
): Promise<FernTurbopufferRecord[]> => {
  return queryTurbopuffer(query, {
    namespace: `${domain}_${model.modelId}`,
    apiKey: turbopufferApiKey(),
    topK,
    vectorizer: async (text) => {
      const embedding = await embed({
        model,
        value: text,
      });
      return embedding.embedding;
    },
  });
};
