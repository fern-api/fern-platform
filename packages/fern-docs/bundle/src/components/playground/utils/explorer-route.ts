import { FernNavigation } from "@fern-api/fdr-sdk";
import { addLeadingSlash } from "@fern-docs/utils";
import escapeStringRegexp from "escape-string-regexp";

/**
 * Conforms the slug to the explorer route.
 *
 * For example, if the original slug is "docs/foo/bar" and the root slug is "docs",
 * the explorer route is "/docs/~/api-explorer/foo/bar".
 */
export function conformExplorerRoute(
  slug: FernNavigation.Slug,
  rootslug: FernNavigation.Slug
): string {
  return addLeadingSlash(
    FernNavigation.slugjoin(
      rootslug,
      "~/api-explorer",
      slug.replace(new RegExp(`^${escapeStringRegexp(rootslug)}/`), "")
    )
  );
}
