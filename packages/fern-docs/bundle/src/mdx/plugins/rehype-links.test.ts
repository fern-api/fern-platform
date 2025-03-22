import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { withDefaultProtocol } from "@fern-api/ui-core-utils";
import { addLeadingSlash, conformTrailingSlash } from "@fern-docs/utils";

export function createReplaceHref(
  rootSlug: string,
  versionSlug: string,
  slugMap: Map<string, FernNavigation.NavigationNodeWithMetadata>,
  loader: { domain: string }
): (href: string) => string | undefined {
  function replaceHref(href: string): string | undefined {
    if (href.startsWith("/")) {
      const url = new URL(href, withDefaultProtocol(loader.domain));
      if (versionSlug != null) {
        const slugWithVersion = FernNavigation.slugjoin(
          versionSlug,
          url.pathname
        );
        const found = slugMap.get(slugWithVersion);
        if (found) {
          return `${conformTrailingSlash(addLeadingSlash(found.slug))}${url.search}${url.hash}`;
        }
      }

      if (rootSlug.length > 0) {
        const slugWithRoot = FernNavigation.slugjoin(rootSlug, url.pathname);
        const found = slugMap.get(slugWithRoot);
        if (found) {
          return `${conformTrailingSlash(addLeadingSlash(found.slug))}${url.search}${url.hash}`;
        }
      }
    }
    return;
  }

  return replaceHref;
}

describe("rehypeLinks", () => {
  const mockLoader = { domain: "https://example.com" };
  const mockSlugMap = new Map<
    string,
    FernNavigation.NavigationNodeWithMetadata
  >();

  const pageNode: FernNavigation.PageNode = {
    type: "page",
    title: "Test Page",
    slug: FernNavigation.Slug("/root/page"),
    pageId: FernNavigation.PageId("page.mdx"),
    id: FernNavigation.NodeId("page"),
    viewers: [],
    noindex: false,
    featureFlags: [],
    canonicalSlug: FernNavigation.Slug("/root/v1/page"),
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    orphaned: undefined,
  };

  const versionedPageNode: FernNavigation.PageNode = {
    type: "page",
    title: "Test Page",
    slug: FernNavigation.Slug("/root/v1/page"),
    pageId: FernNavigation.PageId("page.mdx"),
    id: FernNavigation.NodeId("page"),
    viewers: [],
    noindex: false,
    featureFlags: [],
    canonicalSlug: FernNavigation.Slug("/root/v1/page"),
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    orphaned: undefined,
  };

  beforeEach(() => {
    mockSlugMap.clear();
  });

  it("should handle version and root slug correctly", () => {
    mockSlugMap.set("root/page", pageNode);
    mockSlugMap.set("root/v1/page", versionedPageNode);

    const replaceHref = createReplaceHref(
      "root",
      "v1",
      mockSlugMap,
      mockLoader
    );
    expect(replaceHref("/page")).toBe("/root/page");
  });

  it("should handle root slug without version", () => {
    mockSlugMap.set("root/page", pageNode);
    mockSlugMap.set("root/v1/page", versionedPageNode);

    const replaceHref = createReplaceHref("root", "", mockSlugMap, mockLoader);
    expect(replaceHref("/page")).toBe("/root/page");
  });

  it("should return undefined for unmatched paths", () => {
    const replaceHref = createReplaceHref(
      "root",
      "v1",
      mockSlugMap,
      mockLoader
    );
    expect(replaceHref("/nonexistent")).toBeUndefined();
  });

  it("should not duplicate root slug", () => {
    mockSlugMap.set("root/page", pageNode);
    mockSlugMap.set("root/v1/page", versionedPageNode);

    const replaceHref = createReplaceHref("root", "", mockSlugMap, mockLoader);
    expect(replaceHref("/root/page")).toBe("/root/page");
  });

  it("should not duplicate version", () => {
    mockSlugMap.set("root/page", pageNode);
    mockSlugMap.set("root/v1/page", versionedPageNode);

    const replaceHref = createReplaceHref("root", "", mockSlugMap, mockLoader);
    expect(replaceHref("/root/v1/page")).toBe("/root/v1/page");
  });

  it("should add root to version", () => {
    mockSlugMap.set("root/page", pageNode);
    mockSlugMap.set("root/v1/page", versionedPageNode);

    const replaceHref = createReplaceHref("root", "", mockSlugMap, mockLoader);
    expect(replaceHref("/v1/page")).toBe("/root/v1/page");
  });
});
