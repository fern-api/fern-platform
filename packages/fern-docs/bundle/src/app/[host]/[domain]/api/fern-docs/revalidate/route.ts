import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { FernNavigation } from "@fern-api/fdr-sdk";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import {
  HEADER_X_FERN_HOST,
  addLeadingSlash,
  conformTrailingSlash,
  withoutStaging,
} from "@fern-docs/utils";

import { DocsLoader, createCachedDocsLoader } from "@/server/docs-loader";
import {
  queueAlgoliaReindex,
  queueTurbopufferReindex,
} from "@/server/queue-reindex";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ host: string; domain: string }> }
): Promise<NextResponse> {
  const { host, domain } = await props.params;

  const stream = new ReadableStream({
    async start(controller) {
      revalidateTag(domain);
      controller.enqueue(`revalidating:${domain}\n`);

      const docs = await createCachedDocsLoader(host, domain);
      const reindexPromise = reindex(docs, host, domain)
        .then((services) => {
          controller.enqueue(`reindex-queued:${services.join(",")}\n`);
        })
        .catch((e: unknown) => {
          console.error(e);
          controller.enqueue(`reindex-failed:${String(e)}\n`);
        });

      const root = await docs.unsafe_getFullRoot();
      const collector = FernNavigation.NodeCollector.collect(root);

      controller.enqueue(`revalidate-queued:${collector.slugs.length}\n`);

      const promises = collector.slugs.map(async (slug) => {
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
          controller.enqueue(`revalidate-failed:${url}:${String(e)}\n`);
        }
      });

      await Promise.all(promises);

      // finish reindexing before returning
      await reindexPromise;

      controller.close();
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
    },
  });
}

async function reindex(loader: DocsLoader, host: string, domain: string) {
  const [{ basePath }, flags, orgMetadata] = await Promise.all([
    loader.getBaseUrl(),
    loader.getEdgeFlags(),
    loader.getMetadata(),
  ]);
  if (orgMetadata.isPreview === false) {
    await queueAlgoliaReindex(host, withoutStaging(domain), basePath);
    if (flags.isAskAiEnabled) {
      await queueTurbopufferReindex(host, withoutStaging(domain), basePath);
      return ["algolia", "turbopuffer"];
    }
    return ["algolia"];
  }
  return [];
}
