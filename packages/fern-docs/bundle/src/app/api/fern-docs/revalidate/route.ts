import { createCachedDocsLoader } from "@/server/cached-docs-loader";
import { getDocsDomainEdge, getHostEdge } from "@/server/xfernhost/edge";
import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  addLeadingSlash,
  conformTrailingSlash,
  HEADER_X_FERN_HOST,
} from "@fern-docs/utils";
import { revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const domain = getDocsDomainEdge(req);
  const host = getHostEdge(req);

  revalidateTag(domain);

  if (req.nextUrl.searchParams.get("regenerate") === "true") {
    const docs = await createCachedDocsLoader();
    const root = await docs.unsafe_getFullRoot();
    if (!root) {
      notFound();
    }
    const collector = FernNavigation.NodeCollector.collect(root);

    const promises = collector.slugs.map((slug) => {
      return fetch(
        `${req.nextUrl.origin}${conformTrailingSlash(addLeadingSlash(slug))}`,
        {
          method: "HEAD",
          cache: "no-store",
          headers: { [HEADER_X_FERN_HOST]: domain },
        }
      );
    });

    await Promise.all(promises);
  }

  return NextResponse.json({
    message: `Revalidated ${domain}`,
  });
}
