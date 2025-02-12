import { FernNavigation } from "@fern-api/fdr-sdk";
import { addLeadingSlash } from "@fern-docs/utils";

/**
 * Conforms the slug to the explorer route.
 */
export function conformExplorerRoute(slug: FernNavigation.Slug): string {
  return addLeadingSlash(slug) + "/~explorer";
}
