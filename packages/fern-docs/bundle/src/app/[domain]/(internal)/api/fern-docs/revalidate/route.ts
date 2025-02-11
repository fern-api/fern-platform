import { revalidateTag } from "next/cache";
import { notFound } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

import { FernNavigation } from "@fern-api/fdr-sdk";
import {
  HEADER_X_FERN_HOST,
  addLeadingSlash,
  conformTrailingSlash,
} from "@fern-docs/utils";

import { createCachedDocsLoader } from "@/server/docs-loader";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ domain: string }> }
): Promise<NextResponse> {
  const { domain } = await props.params;

  revalidateTag(domain);

  if (req.nextUrl.searchParams.get("regenerate") === "true") {
    const docs = await createCachedDocsLoader(domain);
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
