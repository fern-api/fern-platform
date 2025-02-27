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

  revalidateTag(domain);

  const docs = await createCachedDocsLoader(host, domain);
  const reindexPromise = reindex(docs, host, domain);

  const successfulRevalidations: string[] = [];
  const failedRevalidations: string[] = [];

  if (req.nextUrl.searchParams.get("regenerate") === "true") {
    const root = await docs.unsafe_getFullRoot();
    const collector = FernNavigation.NodeCollector.collect(root);

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
        successfulRevalidations.push(url);
      } catch (e) {
        failedRevalidations.push(url);
        console.error(e);
      }
    });

    await Promise.all(promises);
  }

  // finish reindexing before returning
  await reindexPromise;

  return NextResponse.json({
    message: `Revalidated ${domain}`,
    successfulRevalidations: [],
    failedRevalidations: [],
  });
}

async function reindex(loader: DocsLoader, host: string, domain: string) {
  try {
    const [{ basePath }, flags, orgMetadata] = await Promise.all([
      loader.getBaseUrl(),
      loader.getEdgeFlags(),
      loader.getMetadata(),
    ]);
    if (orgMetadata.isPreview === false) {
      await queueAlgoliaReindex(host, withoutStaging(domain), basePath);
      if (flags.isAskAiEnabled) {
        await queueTurbopufferReindex(host, withoutStaging(domain), basePath);
      }
    }
  } catch (err) {
    console.error(err);
  }
}
