import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { createOpenAI } from "@ai-sdk/openai";
import { safeVerifyFernJWTConfig } from "@fern-docs/auth";
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import { createDefaultSystemPrompt } from "@fern-docs/search-server";
import {
  FernTurbopufferRecord,
  queryTurbopuffer,
  toDocuments,
} from "@fern-docs/search-server/turbopuffer";
import { CoreMessage, embed, EmbeddingModel, streamText, tool } from "ai";
import { PostHog } from "posthog-node";
import { z } from "zod";

async function POST(
  req: Request,
  env: Env,
  track: (event: string, properties: Record<string, string | number>) => void
) {
  const domain = req.headers.get("X-Fern-Host");
  const fern_token = req.headers.get("X-Fern-Token") ?? undefined;

  if (!domain) {
    return notFound();
  }

  const queryTurbopuffer = createQueryTurbopuffer(env);

  const bedrock = createAmazonBedrock({
    region: "us-west-2",
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  });
  const languageModel = bedrock("anthropic.claude-3-5-sonnet-20241022-v2:0");

  const openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  const embeddingModel = openai.embedding("text-embedding-3-small");

  const namespace = `${domain}_${embeddingModel.modelId}`;
  const { messages } = (await req.json()) as { messages: CoreMessage[] };

  const start = Date.now();
  const [authEdgeConfig, edgeFlags] = await Promise.all([
    getAuthEdgeConfig(domain, env.EDGE_CONFIG),
    getEdgeFlags(domain, env.EDGE_CONFIG),
  ]);

  if (!edgeFlags.isAskAiEnabled) {
    throw new Error(`Ask AI is not enabled for ${domain}`);
  }

  const user = await safeVerifyFernJWTConfig(fern_token, authEdgeConfig);

  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === "user");

  const lastUserMessageText =
    typeof lastUserMessage?.content === "string"
      ? lastUserMessage.content
      : lastUserMessage?.content
          .filter((part) => part.type === "text")
          .map((part) => part.text)
          .join("");

  const searchResults = await queryTurbopuffer(lastUserMessageText, {
    embeddingModel,
    namespace,
    authed: user != null,
    roles: user?.roles ?? [],
  });
  const documents = toDocuments(searchResults).join("\n\n");
  const system = createDefaultSystemPrompt({
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
          const response = await queryTurbopuffer(query, {
            embeddingModel,
            namespace,
            authed: user != null,
            roles: user?.roles ?? [],
          });
          return response.map((hit) => {
            const { domain, pathname, hash } = hit.attributes;
            const url = `https://${domain}${pathname}${hash ?? ""}`;
            return { url, ...hit.attributes };
          });
        },
      }),
    },
    experimental_telemetry: {
      isEnabled: true,
      recordInputs: true,
      recordOutputs: true,
      functionId: "ask_ai_chat",
      metadata: {
        domain,
        languageModel: languageModel.modelId,
        embeddingModel: embeddingModel.modelId,
        db: "turbopuffer",
        namespace,
      },
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

  const response = result.toDataStreamResponse();
  withAccessControlHeaders(response.headers);
  return response;
}

function createQueryTurbopuffer(env: Env): (
  query: string | null | undefined,
  opts: {
    embeddingModel: EmbeddingModel<string>;
    namespace: string;
    topK?: number;
    authed?: boolean;
    roles?: string[];
  }
) => Promise<FernTurbopufferRecord[]> {
  return async (query, opts) => {
    return query == null || query.trimStart().length === 0
      ? []
      : await queryTurbopuffer(query, {
          namespace: opts.namespace,
          apiKey: env.TURBOPUFFER_API_KEY,
          topK: opts.topK ?? 20,
          vectorizer: async (text) => {
            const embedding = await embed({
              model: opts.embeddingModel,
              value: text,
            });
            return embedding.embedding;
          },
          authed: opts.authed,
          roles: opts.roles,
        });
  };
}

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method === "OPTIONS") {
      return preflight();
    }
    if (request.method !== "POST") {
      return methodNotAllowed();
    }
    const posthog = new PostHog(env.POSTHOG_API_KEY, {
      host: "https://us.i.posthog.com",
    });
    const response = await POST(request, env, (event, properties) =>
      posthog.capture({
        distinctId: "server-side-event",
        event,
        properties: {
          // anonymize this event because it's server-side https://posthog.com/docs/product-analytics/capture-events?tab=Backend
          $process_person_profile: false,
          ...properties,
        },
      })
    );
    ctx.waitUntil(posthog.shutdown());
    return response;
  },
} satisfies ExportedHandler<Env>;

function preflight() {
  return new Response(null, {
    status: 200,
    headers: withAccessControlHeaders(),
  });
}

function withAccessControlHeaders(headers: Headers = new Headers()): Headers {
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, X-Fern-Host, X-Fern-Token"
  );
  return headers;
}

function methodNotAllowed() {
  return new Response(null, { status: 405 });
}

function notFound() {
  return new Response(null, { status: 404 });
}
