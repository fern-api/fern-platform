import { FernNavigation } from "../../../..";

/**
 * As as temporary workaround, we'll use a simple regex to extract the frontmatter and check for
 * `slug: a/b/c` or `slug: /a/b/c` or `slug: "a/b/c"` or `slug: "/a/b/c/"`.
 */
export function getFullSlugFromFrontmatter(
  frontmatter: string
): FernNavigation.V1.Slug | undefined {
  const match = frontmatter.match(/slug:\s*"?([^"\n\s]+)"?/);
  if (match != null && match[1] != null) {
    return FernNavigation.V1.slugjoin(match[1]);
  }
  return undefined;
}
