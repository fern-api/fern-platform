// add or remove the slug from the cache based on the props

import { FernNavigation } from "@fern-api/fdr-sdk";
import { DocsProps } from "@fern-docs/ui";
import { GetStaticPropsResult } from "next";
import { DocsKVCache } from "./DocsCache";

// this will ensure that `revalidate-all` will invalidate the page if the page no longer exists between revalidations
// this should only be used inside ISR
export async function updateVisitedSlugsCache(
  domain: string,
  slug: FernNavigation.Slug,
  props: GetStaticPropsResult<DocsProps>
): Promise<void> {
  const cache = DocsKVCache.getInstance(domain);
  if ("props" in props) {
    await cache.addVisitedSlugs(slug);
  } else if ("notFound" in props || "redirect" in props) {
    await cache.removeVisitedSlugs(slug);
  }
}
