export * from "./collectApiReferences";
export * from "./collectPageIds";
export * from "./createBreadcrumb";
export * from "./findNode";
export * from "./getApiReferenceId";
export * from "./getNoIndexFromFrontmatter";
export * from "./toApis";
export * from "./toPages";
export * from "./toRootNode";
export * from "./toUnversionedSlug";

/**
 * Removes the product prefix from a slug
 * e.g. "product1/v1/foo/bar" -> "v1/foo/bar"
 */
export function toUnproductedSlug(slug: string, productSlug: string): string {
  if (slug.startsWith(productSlug + "/")) {
    return slug.slice(productSlug.length + 1);
  }
  return slug;
}
