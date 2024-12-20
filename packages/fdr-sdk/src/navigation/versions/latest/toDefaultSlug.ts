import { Slug } from ".";

/**
 * All versioned slugs are prefixed with the version slug, but the default version may be accessed without the version prefix.
 * toDefaultSlug creates the "unversioned" slug for pages under the default version.
 * This should be treated as the cannonical slug for that page.
 */
export function toDefaultSlug(
  slug: Slug,
  rootSlug: Slug,
  versionSlug: Slug
): Slug;
export function toDefaultSlug(
  slug: Slug | undefined,
  rootSlug: Slug,
  versionSlug: Slug
): Slug | undefined;
export function toDefaultSlug(
  slug: Slug | undefined,
  rootSlug: Slug,
  versionSlug: Slug
): Slug | undefined {
  if (slug == null) {
    return undefined;
  }
  if (slug.startsWith(versionSlug)) {
    return Slug(
      slug
        .replace(new RegExp(`^${versionSlug.replaceAll("/", "\\/")}`), rootSlug)
        .replace(/^\//, "")
    );
  }
  return slug;
}
