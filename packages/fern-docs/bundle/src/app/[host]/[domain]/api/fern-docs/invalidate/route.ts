import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { kv } from "@vercel/kv";
import { escapeRegExp } from "es-toolkit/string";

import { ApiDefinition } from "@fern-api/fdr-sdk";
import { ApiDefinitionV1ToLatest } from "@fern-api/fdr-sdk/api-definition";
import { getEdgeFlags } from "@fern-docs/edge-config";

import { loadWithUrl } from "@/server/loadWithUrl";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const start = performance.now();

  const { domain } = await props.params;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        revalidateTag(domain);
        controller.enqueue(`invalidating:${domain}\n`);

        const loadWithUrlPromise = loadWithUrl(domain);

        const [docs, edgeFlags] = await Promise.all([
          loadWithUrlPromise,
          getEdgeFlags(domain),
        ]);

        try {
          const keys = new Set<string>();

          Object.entries(docs.definition.pages).forEach(([id]) => {
            keys.add(`page:${id}`);
          });

          Object.values(docs.definition.apisV2).forEach((api) => {
            const prunedApi = createApiDefinitionCacheKeys(api);
            prunedApi.forEach((key) => {
              keys.add(`api:${key}`);
            });
          });

          Object.values(docs.definition.apis).forEach((api) => {
            const prunedApi = createApiDefinitionCacheKeys(
              ApiDefinitionV1ToLatest.from(api, edgeFlags).migrate()
            );
            prunedApi.forEach((key) => {
              keys.add(`api:${key}`);
            });
          });

          // these are generated from docs-cache, so we need to delete them for now
          // TODO: handle this in the future more gracefully
          await kv.hdel(
            domain,
            "root",
            "config",
            "metadata",
            "files",
            "mdx-bundler-files",
            "fonts",
            "colors",
            ...Array.from(keys)
          );

          controller.enqueue(
            `invalidate-kv-keys-set:${Object.keys(keys).length}\n`
          );
        } catch (e) {
          console.error(e);
          controller.enqueue(
            `invalidate-kv-keys-set-failed:error=${escapeRegExp(String(e))}\n`
          );
        }

        const end = performance.now();
        console.log(`Reindex took ${end - start}ms`);
        controller.enqueue(`invalidate-finished:${end - start}ms\n`);
      } catch (e) {
        console.error(e);
        controller.enqueue(
          `invalidate-failed:error=${escapeRegExp(String(e))}\n`
        );
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

function createApiDefinitionCacheKeys(api: ApiDefinition.ApiDefinition) {
  const keys = new Set<string>();
  Object.keys(api.endpoints).forEach((endpointId) => {
    keys.add(`${api.id}:endpoint:${endpointId}`);
  });
  Object.keys(api.websockets).forEach((webSocketId) => {
    keys.add(`${api.id}:websocket:${webSocketId}`);
  });
  Object.keys(api.webhooks).forEach((webhookId) => {
    keys.add(`${api.id}:webhook:${webhookId}`);
  });
  return keys;
}
