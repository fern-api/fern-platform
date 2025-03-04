import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { kv } from "@vercel/kv";
import { chunk } from "es-toolkit/array";
import { mapValues } from "es-toolkit/object";
import { escapeRegExp } from "es-toolkit/string";
import { UnreachableCaseError } from "ts-essentials";

import { ApiDefinition, DocsV2Read, FernNavigation } from "@fern-api/fdr-sdk";
import {
  ApiDefinitionV1ToLatest,
  EndpointId,
  WebSocketId,
  WebhookId,
  prune,
} from "@fern-api/fdr-sdk/api-definition";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { getEdgeFlags } from "@fern-docs/edge-config";
import {
  EdgeFlags,
  HEADER_X_FERN_HOST,
  addLeadingSlash,
  conformTrailingSlash,
  withoutStaging,
} from "@fern-docs/utils";

import { convertResponseToRootNode } from "@/server/docs-loader";
import { uncachedGetDocsUrlMetadata } from "@/server/getDocsUrlMetadata";
import { loadWithUrl } from "@/server/loadWithUrl";
import {
  queueAlgoliaReindex,
  queueTurbopufferReindex,
} from "@/server/queue-reindex";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const start = performance.now();

  const { host, domain } = await props.params;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        revalidateTag(domain);
        controller.enqueue(`revalidating:${domain}\n`);

        const [docs, edgeFlags, orgMetadata] = await Promise.all([
          loadWithUrl(domain),
          getEdgeFlags(domain),
          uncachedGetDocsUrlMetadata(domain),
        ]);

        let reindexPromise: Promise<void> | undefined;
        if (!orgMetadata.isPreview) {
          reindexPromise = reindex(docs, host, domain, edgeFlags)
            .then((services) => {
              controller.enqueue(
                `reindex-queued:services=${services.join(",")}\n`
              );
            })
            .catch((e: unknown) => {
              console.error(e);
              controller.enqueue(
                `reindex-failed:error=${escapeRegExp(String(e))}\n`
              );
            });
        }

        const root = convertResponseToRootNode(docs, edgeFlags);

        try {
          const keys: Record<string, unknown> = {};

          if (root != null) {
            keys[`${domain}:root`] = root;
          }

          const { navigation, root: _, ...config } = docs.definition.config;
          keys[`${domain}:config`] = config;

          Object.entries(docs.definition.pages).forEach(([id, page]) => {
            keys[`${domain}:page:${id}`] = page;
          });

          Object.values(docs.definition.apisV2).forEach((api) => {
            const prunedApi = createPrunedApi(api);
            prunedApi.forEach((value, key) => {
              keys[`${domain}:api:${key}`] = value;
            });
          });

          Object.values(docs.definition.apis).forEach((api) => {
            const prunedApi = createPrunedApi(
              ApiDefinitionV1ToLatest.from(api, edgeFlags).migrate()
            );
            prunedApi.forEach((value, key) => {
              keys[`${domain}:api:${key}`] = value;
            });
          });

          keys[`${domain}:files`] = mapValues(
            docs.definition.filesV2,
            (file) => {
              if (file.type === "url") {
                return {
                  src: file.url,
                };
              } else if (file.type === "image") {
                return {
                  src: file.url,
                  width: file.width,
                  height: file.height,
                  blurDataURL: file.blurDataUrl,
                  alt: file.alt,
                };
              }
              throw new UnreachableCaseError(file);
            }
          );

          keys[`${domain}:mdx-bundler-files`] = docs.definition.jsFiles ?? {};

          const promises = [];

          for (const [key, value] of Object.entries(keys)) {
            promises.push(kv.set(key, value));
          }

          const results = await Promise.allSettled(promises);

          results.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `Failed to set kv key ${Object.keys(keys)[index]}: ${result.reason}`
              );
            }
          });

          await kv.del(`${domain}:fonts`, `${domain}:colors`);

          controller.enqueue(
            `revalidate-kv-keys-set:${Object.keys(keys).length}\n`
          );
        } catch (e) {
          console.error(e);
          controller.enqueue(
            `revalidate-kv-keys-set-failed:error=${escapeRegExp(String(e))}\n`
          );
        }

        if (req.nextUrl.searchParams.get("regenerate") !== "false") {
          const collector = FernNavigation.NodeCollector.collect(root);
          const batches = chunk(collector.staticPageSlugs, 200);

          controller.enqueue(
            `revalidate-queued:urls=${collector.slugs.length};batches=${batches.length}\n`
          );

          for (let i = 0; i < batches.length; i++) {
            controller.enqueue(
              `revalidate-batch:${i * 200 + 1}-${Math.min(
                (i + 1) * 200,
                collector.slugs.length
              )}/${collector.slugs.length}\n`
            );
            await Promise.all(
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-non-null-assertion
              batches[i]!.map(async (slug) => {
                const url = withDefaultProtocol(
                  `${domain}${conformTrailingSlash(addLeadingSlash(slug))}`
                );
                try {
                  const res = await fetch(
                    `${req.nextUrl.origin}${conformTrailingSlash(addLeadingSlash(slug))}`,
                    {
                      method: "HEAD",
                      cache: "no-store",
                      headers: { [HEADER_X_FERN_HOST]: domain },
                    }
                  );
                  if (!res.ok) {
                    throw new Error(`Failed to revalidate ${url}`);
                  }
                  controller.enqueue(`revalidated:${url}\n`);
                } catch (e) {
                  console.error(e);
                  controller.enqueue(
                    `revalidate-failed:url=${url}:error=${escapeRegExp(String(e))}\n`
                  );
                }
              })
            );
          }
        }

        // finish reindexing before returning
        await reindexPromise;

        const end = performance.now();
        console.log(`Reindex took ${end - start}ms`);
        controller.enqueue(`revalidate-finished:${end - start}ms\n`);
      } catch (e) {
        console.error(e);
        controller.enqueue(
          `revalidate-failed:error=${escapeRegExp(String(e))}\n`
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

async function reindex(
  docs: DocsV2Read.LoadDocsForUrlResponse,
  host: string,
  domain: string,
  edgeFlags: EdgeFlags
) {
  const { basePath } = docs.baseUrl;

  await queueAlgoliaReindex(host, withoutStaging(domain), basePath);
  if (edgeFlags.isAskAiEnabled) {
    await queueTurbopufferReindex(host, withoutStaging(domain), basePath);
    return ["algolia", "turbopuffer"];
  }
  return ["algolia"];
}

function createPrunedApi(api: ApiDefinition.ApiDefinition) {
  const apis = new Map<string, ApiDefinition.ApiDefinition>();
  Object.keys(api.endpoints).forEach((endpointId) => {
    apis.set(
      `${api.id}:endpoint:${endpointId}`,
      prune(api, { type: "endpoint", endpointId: endpointId as EndpointId })
    );
  });
  Object.keys(api.websockets).forEach((webSocketId) => {
    apis.set(
      `${api.id}:websocket:${webSocketId}`,
      prune(api, { type: "webSocket", webSocketId: webSocketId as WebSocketId })
    );
  });
  Object.keys(api.webhooks).forEach((webhookId) => {
    apis.set(
      `${api.id}:webhook:${webhookId}`,
      prune(api, { type: "webhook", webhookId: webhookId as WebhookId })
    );
  });
  return apis;
}
