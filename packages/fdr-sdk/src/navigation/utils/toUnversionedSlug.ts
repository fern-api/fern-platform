import { escapeRegExp } from "es-toolkit/string";

import { Slug } from "..";

/**
 * This is the part of the slug after the version (or basepath) prefix.
 *
 * For example, if the original slug is "docs/v1.0.0/foo/bar", the unversionedSlug is "foo/bar".
 */
export function toUnversionedSlug(slug: Slug, versionSlug: Slug): Slug {
  return Slug(
    slug.replace(new RegExp(`^${escapeRegExp(versionSlug)}(/|$)`), "")
  );
}
