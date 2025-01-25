import type { FernNavigation } from "@fern-api/fdr-sdk";
import type { Redirect } from "next/types";

export async function handleLoadDocsError(
  xFernHost: string,
  slug: FernNavigation.Slug,
  error: Error
): Promise<{ redirect: Redirect } | { notFound: true }> {
  console.error(
    `Failed to load initial props for docs page: https://${xFernHost}/${slug}`,
    error
  );
  return { notFound: true };
}
