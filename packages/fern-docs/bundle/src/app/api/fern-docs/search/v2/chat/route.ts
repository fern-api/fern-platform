import { track } from "@/server/analytics/posthog";
import { safeVerifyFernJWTConfig } from "@/server/auth/FernJWT";
import { getOrgMetadataForDomain } from "@/server/auth/metadata-for-url";
import { openaiApiKey, turbopufferApiKey } from "@/server/env-variables";
import { getDocsDomainEdge } from "@/server/xfernhost/edge";
import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  createDefaultSystemPrompt,
  createWebflowSystemPrompt,
} from "@fern-docs/search-server";
import {
  queryTurbopuffer,
  toDocuments,
} from "@fern-docs/search-server/turbopuffer";
import { COOKIE_FERN_TOKEN, withoutStaging } from "@fern-docs/utils";
import { WebClient } from "@slack/web-api";
import {
  embed,
  EmbeddingModel,
  InvalidToolArgumentsError,
  NoSuchToolError,
  streamText,
  tool,
  ToolExecutionError,
} from "ai";
import { initLogger, wrapAISDKModel } from "braintrust";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const maxDuration = 60;
export const revalidate = 0;
const engNotifsSlackChannel = "#engineering-notifs";

export async function POST(req: NextRequest) {
  initLogger({
    projectName: "Braintrust Evaluation",
    apiKey: process.env.BRAINTRUST_API_KEY,
  });

  const { messages, url } = await req.json();

  // TODO: Make this a docs.yml config
  const isWebflow =
    typeof url === "string"
      ? url.includes("webflow-ai") || url.includes("localhost")
      : false;

  const bedrock = createAmazonBedrock({
    region: isWebflow ? "us-east-1" : "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  });

  let webflowVersion: string | undefined = undefined;
  if (isWebflow) {
    if (url.includes("/v2.0.0/data/")) {
      webflowVersion = "Data API v2";
    } else if (url.includes("/designer/")) {
      webflowVersion = "Designer API v2";
    } else if (url.includes("/browser/")) {
      webflowVersion = "Browser API";
    }
  }

  const languageModel = isWebflow
    ? wrapAISDKModel(bedrock("us.anthropic.claude-3-7-sonnet-20250219-v1:0"))
    : wrapAISDKModel(bedrock("us.anthropic.claude-3-5-sonnet-20241022-v2:0"));
  // END WEBFLOW SPECIFIC CODE

  const openai = createOpenAI({ apiKey: openaiApiKey() });
  const embeddingModel = openai.embedding("text-embedding-3-large");

  const domain = getDocsDomainEdge(req);
  const namespace = `${withoutStaging(domain)}_${embeddingModel.modelId}`;

  const orgMetadata = await getOrgMetadataForDomain(withoutStaging(domain));
  if (orgMetadata == null) {
    return NextResponse.json("Not found", { status: 404 });
  }

  if (orgMetadata.isPreviewUrl) {
    return NextResponse.json({
      added: 0,
      updated: 0,
      deleted: 0,
      unindexable: 0,
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

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const fern_token = (await cookies()).get(COOKIE_FERN_TOKEN)?.value;
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
    version: webflowVersion,
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
            version: webflowVersion,
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
      await track("ask_ai", {
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
    version?: string;
  }
) {
  return query == null || query.trimStart().length === 0
    ? []
    : await queryTurbopuffer(
        query + (opts.version ? ` version: ${opts.version}` : ""),
        {
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
          filters: opts.version
            ? [["version", "Eq", opts.version]]
            : opts.authed
              ? [["authed", "Eq", true]]
              : undefined,
          mode: "bm25",
          authed: opts.authed,
          roles: opts.roles,
        }
      );
}
