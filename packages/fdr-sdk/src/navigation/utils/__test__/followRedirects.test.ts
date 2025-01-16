import { FernNavigation } from "../../..";
import { followRedirect } from "../followRedirect";

function sectionNode(
  section: Partial<FernNavigation.SectionNode> &
    Pick<FernNavigation.SectionNode, "slug">
): FernNavigation.SectionNode {
  return {
    type: "section",
    title: "Section",
    children: [],
    id: FernNavigation.NodeId("0"),
    collapsed: undefined,
    canonicalSlug: undefined,
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    viewers: undefined,
    orphaned: undefined,
    overviewPageId: undefined,
    noindex: undefined,
    pointsTo: undefined,
    featureFlags: undefined,
    ...section,
  };
}

function pageNode(
  page: Partial<FernNavigation.PageNode> & Pick<FernNavigation.PageNode, "slug">
): FernNavigation.PageNode {
  return {
    type: "page",
    title: "Page",
    pageId: FernNavigation.PageId("page.mdx"),
    id: FernNavigation.NodeId("1"),
    canonicalSlug: undefined,
    icon: undefined,
    hidden: undefined,
    authed: undefined,
    viewers: undefined,
    orphaned: undefined,
    noindex: undefined,
    featureFlags: undefined,
    ...page,
  };
}

describe("followRedirect", () => {
  it("should return null if the node is not a page", () => {
    expect(
      followRedirect(
        sectionNode({
          id: FernNavigation.NodeId("1"),
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe(undefined);
  });

  it("should return itself if the node is a page", () => {
    expect(
      followRedirect(
        pageNode({
          id: FernNavigation.NodeId("1"),
          slug: FernNavigation.Slug("path/to/page"),
        })
      )
    ).toBe("path/to/page");

    expect(
      followRedirect(
        sectionNode({
          slug: FernNavigation.Slug("path/to/section"),
          overviewPageId: FernNavigation.PageId("path/to/section/overview.mdx"),
        })
      )
    ).toBe("path/to/section");
  });

  it("should follow redirects", () => {
    expect(
      followRedirect(
        sectionNode({
          children: [
            pageNode({
              id: FernNavigation.NodeId("2"),
              slug: FernNavigation.Slug("path/to/page"),
            }),
          ],
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe("path/to/page");

    expect(
      followRedirect(
        sectionNode({
          children: [
            sectionNode({
              slug: FernNavigation.Slug("path/to/section"),
            }),
            pageNode({
              id: FernNavigation.NodeId("3"),
              slug: FernNavigation.Slug("path/to/page"),
            }),
          ],
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe("path/to/page");
  });

  it("should skip hidden and authed nodes", () => {
    expect(
      followRedirect(
        sectionNode({
          id: FernNavigation.NodeId("1"),
          type: "section",
          title: "Section",
          children: [
            pageNode({
              slug: FernNavigation.Slug("hidden-page"),
              hidden: true,
            }),
            pageNode({
              slug: FernNavigation.Slug("authed-page"),
              authed: true,
            }),
            pageNode({
              slug: FernNavigation.Slug("path/to/page"),
            }),
          ],
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe("path/to/page");
  });

  it("should not follow redirects if the destination is an authed page", () => {
    expect(
      followRedirect(
        sectionNode({
          children: [
            pageNode({
              slug: FernNavigation.Slug("path/to/page"),
              authed: true,
            }),
          ],
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe(undefined);
  });

  it("should follow redirects even if the intermediate node is authed", () => {
    expect(
      followRedirect(
        sectionNode({
          children: [
            sectionNode({
              children: [
                pageNode({
                  slug: FernNavigation.Slug("path/to/page"),
                }),
              ],
              slug: FernNavigation.Slug("path/to/section"),
              authed: true, // <--- this is authed
            }),
          ],
          slug: FernNavigation.Slug("section"),
        })
      )
    ).toBe("path/to/page");
  });
});
