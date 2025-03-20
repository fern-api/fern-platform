import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { waitUntil } from "@vercel/functions";
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
import { getAuthEdgeConfig, getEdgeFlags } from "@fern-docs/edge-config";
import {
  EdgeFlags,
  HEADER_X_FERN_HOST,
  slugToHref,
  withoutStaging,
} from "@fern-docs/utils";

import {
  convertResponseToRootNode,
  createEndpointCacheKey,
  getMetadataFromResponse,
} from "@/server/docs-loader";
import { loadWithUrl } from "@/server/loadWithUrl";
import {
  queueAlgoliaReindex,
  queueTurbopufferReindex,
} from "@/server/queue-reindex";
import { pruneWithAuthState } from "@/server/withRbac";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const cdnUri = process.env.NEXT_PUBLIC_CDN_URI;
  const start = performance.now();

  const { host, domain } = await props.params;
  revalidateTag(domain);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        try {
          await kv.del(domain);
        } catch (e) {
          console.debug(
            "Attempted to delete key",
            domain,
            "but failed with",
            e
          );
        }

        // note: adds to "domain" for deployment-promoted webhook
        if (cdnUri) {
          waitUntil(kv.sadd(`${cdnUri}:domains`, domain));
        }

        controller.enqueue(`revalidating:${domain}\n`);

        const loadWithUrlPromise = loadWithUrl(domain);

        const [docs, edgeFlags, metadata, authConfig] = await Promise.all([
          loadWithUrlPromise,
          getEdgeFlags(domain),
          getMetadataFromResponse(withoutStaging(domain), loadWithUrlPromise),
          getAuthEdgeConfig(domain),
        ]);

        let reindexPromise: Promise<void> | undefined;
        if (
          !metadata.isPreview &&
          // reindex unless explicitly disabled
          req.nextUrl.searchParams.get("reindex") !== "false"
        ) {
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
        let staticRoot = root;

        // maybe prune the root node if we have an auth config
        if (staticRoot && authConfig) {
          staticRoot = pruneWithAuthState(
            {
              authed: false,
              authorizationUrl: undefined,
              partner: undefined,
              ok: true,
            },
            authConfig,
            staticRoot
          );
        }

        try {
          const keys: Record<string, unknown> = {};

          keys.metadata = metadata;

          if (root != null) {
            keys.root = root;
          }

          const { navigation, root: _, ...config } = docs.definition.config;
          keys.config = config;

          Object.entries(docs.definition.pages).forEach(([id, page]) => {
            keys[`page:${id}`] = page;
          });

          Object.values(docs.definition.apisV2).forEach((api) => {
            const prunedApi = createPrunedApi(api);
            prunedApi.forEach((value, key) => {
              keys[`api:${key}`] = value;
            });
          });

          Object.values(docs.definition.apis).forEach((api) => {
            const prunedApi = createPrunedApi(
              ApiDefinitionV1ToLatest.from(api, edgeFlags).migrate()
            );
            prunedApi.forEach((value, key) => {
              keys[`api:${key}`] = value;
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

          keys[`mdx-bundler-files`] = docs.definition.jsFiles ?? {};

          const promises = [];

          for (const [key, value] of Object.entries(keys)) {
            promises.push(kv.hset(domain, { [key]: value }));
          }

          const results = await Promise.allSettled(promises);

          results.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `Failed to set kv key ${Object.keys(keys)[index]}: ${result.reason}`
              );
            }
          });

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
          const collector = FernNavigation.NodeCollector.collect(staticRoot);
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
                const url = withDefaultProtocol(`${domain}${slugToHref(slug)}`);
                // force revalidate the static page
                revalidatePath(
                  `/${host}/${domain}/static/${encodeURIComponent(slugToHref(slug))}`,
                  "page"
                );
                try {
                  let res;
                  let attempts = 0;
                  while (attempts < 3) {
                    try {
                      res = await fetch(
                        `${req.nextUrl.origin}${slugToHref(slug)}`,
                        {
                          method: "HEAD",
                          cache: "no-store",
                          headers: { [HEADER_X_FERN_HOST]: domain },
                        }
                      );
                      // break if we get a successful response
                      if (res.ok) {
                        break;
                      }
                    } catch (e) {
                      console.debug(
                        `Failed to revalidate URL ${req.nextUrl.origin}${slugToHref(slug)}, trying again...`
                      );
                      attempts++;
                      if (attempts === 3) throw e;
                      // Add exponential backoff with jitter
                      const backoffMs = Math.min(
                        1000 * Math.pow(2, attempts - 1),
                        4000
                      );
                      const jitter = Math.random() * 200;
                      await new Promise((resolve) =>
                        setTimeout(resolve, backoffMs + jitter)
                      );
                    }
                  }
                  if (!res?.ok) {
                    throw new Error(
                      `Failed to revalidate ${url}. Status code: ${res?.status}`
                    );
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
    const pruneKey = {
      type: "endpoint",
      endpointId: endpointId as EndpointId,
    } as const;
    apis.set(
      `${api.id}:${createEndpointCacheKey(pruneKey)}`,
      prune(api, pruneKey)
    );
  });
  Object.keys(api.websockets).forEach((webSocketId) => {
    const pruneKey = {
      type: "webSocket",
      webSocketId: webSocketId as WebSocketId,
    } as const;
    apis.set(
      `${api.id}:${createEndpointCacheKey(pruneKey)}`,
      prune(api, pruneKey)
    );
  });
  Object.keys(api.webhooks).forEach((webhookId) => {
    const pruneKey = {
      type: "webhook",
      webhookId: webhookId as WebhookId,
    } as const;
    apis.set(
      `${api.id}:${createEndpointCacheKey(pruneKey)}`,
      prune(api, pruneKey)
    );
  });
  return apis;
}
