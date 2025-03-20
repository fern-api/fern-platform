import { NextRequest, NextResponse } from "next/server";

import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";
import { WebClient } from "@slack/web-api";
import {
  EmbeddingModel,
  InvalidToolArgumentsError,
  NoSuchToolError,
  ToolExecutionError,
  embed,
  streamText,
  tool,
} from "ai";
import { initLogger, wrapAISDKModel } from "braintrust";
import { z } from "zod";

import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  createDefaultSystemPrompt,
  createWebflowSystemPrompt,
} from "@fern-docs/search-server";
import {
  queryTurbopuffer,
  toDocuments,
} from "@fern-docs/search-server/turbopuffer";
import { FacetFilter } from "@fern-docs/search-ui";
import { withoutStaging } from "@fern-docs/utils";

import { getFernToken } from "@/app/fern-token";
import { track } from "@/server/analytics/posthog";
import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { createCachedDocsLoader } from "@/server/docs-loader";
import { openaiApiKey, turbopufferApiKey } from "@/server/env-variables";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";

export const maxDuration = 60;
export const revalidate = 0;
const engNotifsSlackChannel = "#engineering-notifs";

export async function POST(req: NextRequest) {
  initLogger({
    projectName: "Braintrust Evaluation",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  const bedrock = createAmazonBedrock({
    region: "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  const openai = createOpenAI({ apiKey: openaiApiKey() });
  const embeddingModel = openai.embedding("text-embedding-3-large");

  const host = req.nextUrl.host;
  const domain = getDocsDomainEdge(req);
  const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;
  const { messages, url, filters } = await req.json();

  // TODO: move system prompt to docs.yml
  const isWebflow = url.includes("webflow-ai");

  const languageModel = isWebflow
    ? wrapAISDKModel(bedrock("us.anthropic.claude-3-7-sonnet-20250219-v1:0"))
    : wrapAISDKModel(bedrock("us.anthropic.claude-3-5-sonnet-20241022-v2:0"));

  const loader = await createCachedDocsLoader(host, domain);
  const metadata = await loader.getMetadata();
  if (metadata == null) {
    return NextResponse.json("Not found", { status: 404 });
  }

  if (metadata.isPreview) {
    return NextResponse.json("Chat is not enabled for preview environments", {
      status: 404,
    });
  }

  const start = Date.now();
  const [authEdgeConfig, edgeFlags] = await Promise.all([
    getAuthEdgeConfig(domain),
    getEdgeFlags(domain),
  ]);

  if (!edgeFlags.isAskAiEnabled) {
    throw new Error(`Ask AI is not enabled for ${domain}`);
  }

  const fern_token = await getFernToken();
  const user = await safeVerifyFernJWTConfig(fern_token, authEdgeConfig);

  const lastUserMessage: string | undefined = messages.findLast(
    (message: any) => message.role === "user"
  )?.content;

  const searchResults = await runQueryTurbopuffer(lastUserMessage, {
    embeddingModel,
    namespace,
    authed: user != null,
    roles: user?.roles ?? [],
    topK: 5,
    filters,
  });
  const documents = toDocuments(searchResults).join("\n\n");
  const system = isWebflow
    ? createWebflowSystemPrompt({
        domain,
        date: new Date().toDateString(),
        documents,
      })
    : createDefaultSystemPrompt({
        domain,
        date: new Date().toDateString(),
        documents,
      });
  const result = streamText({
    model: languageModel,
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
          const response = await runQueryTurbopuffer(query, {
            embeddingModel,
            namespace,
            authed: user != null,
            roles: user?.roles ?? [],
            filters,
          });
          return response.map((hit) => {
            const { domain, pathname, hash } = hit.attributes;
            const url = `https://${domain}${pathname}${hash ?? ""}`;
            return { url, ...hit.attributes };
          });
        },
      }),
    },
    onFinish: async (e) => {
      const end = Date.now();
      track("ask_ai", {
        languageModel: languageModel.modelId,
        embeddingModel: embeddingModel.modelId,
        durationMs: end - start,
        domain,
        namespace,
        numToolCalls: e.toolCalls.length,
        finishReason: e.finishReason,
        ...e.usage,
      });
      e.warnings?.forEach((warning) => {
        console.warn(warning);
      });
    },
  });

  const response = result.toDataStreamResponse({
    getErrorMessage: (error) => {
      if (error == null) {
        return "";
      }

      let errorKind = "UnknownError";
      if (NoSuchToolError.isInstance(error)) {
        errorKind = "NoSuchToolError";
      } else if (InvalidToolArgumentsError.isInstance(error)) {
        errorKind = "InvalidToolArgumentsError";
      } else if (ToolExecutionError.isInstance(error)) {
        errorKind = "ToolExecutionError";
      }

      const msg = `encountered a ${errorKind} for query '${lastUserMessage}: ${error}'`;
      console.error(msg);
      const slackToken = process.env.SLACK_TOKEN;
      if (slackToken) {
        const slackMsg = `:rotating_light: [${domain}] \`Ask AI\` encountered a ${errorKind} for query '${lastUserMessage}': \`${error}\``;
        const webClient = new WebClient(slackToken);
        webClient.chat
          .postMessage({
            channel: engNotifsSlackChannel,
            text: slackMsg,
          })
          .catch((err: unknown) => {
            console.error(err);
          });
      }
      return msg;
    },
  });

  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return response;
}

async function runQueryTurbopuffer(
  query: string | null | undefined,
  opts: {
    embeddingModel: EmbeddingModel<string>;
    namespace: string;
    topK?: number;
    authed?: boolean;
    roles?: string[];
    filters?: FacetFilter[];
  }
) {
  return query == null || query.trimStart().length === 0
    ? []
    : await queryTurbopuffer(query, {
        namespace: opts.namespace,
        apiKey: turbopufferApiKey(),
        topK: opts.topK ?? 10,
        vectorizer: async (text) => {
          const embedding = await embed({
            model: opts.embeddingModel,
            value: text,
          });
          return embedding.embedding;
        },
        mode: "hybrid",
        authed: opts.authed,
        roles: opts.roles,
        filters: opts.filters,
      });
}
