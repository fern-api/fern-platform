import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { markdownToString } from "@fern-docs/mdx";
import { DefinitionObjectFactory } from "@fern-platform/fdr-utils";
import { extractHeadline, getSeoProps } from "../getSeoProp";

describe("getSeoProps", () => {
  it("seo disabled", () => {
    const props = getSeoProps(
      "host",
      DefinitionObjectFactory.createDocsDefinition().config,
      {},
      {},
      {},
      {
        node: {
          id: FernNavigation.NodeId("id"),
          type: "page",
          pageId: FernNavigation.PageId("pageId"),
          title: "page",
          slug: FernNavigation.Slug("slug"),
          canonicalSlug: undefined,
          icon: undefined,
          hidden: false,
          noindex: undefined,
          authed: undefined,
          viewers: undefined,
          orphaned: undefined,
          featureFlags: undefined,
        },
        parents: [],
        currentVersion: undefined,
        root: {
          slug: FernNavigation.Slug(""),
        } as FernNavigation.RootNode,
      },
      true,
      false
    );
    expect(props.noindex).toBe(true);
    expect(props.nofollow).toBe(true);
  });

  it("extracts SEO title properly", () => {
    expect(markdownToString(extractHeadline("#"))).toBe("");
    expect(markdownToString(extractHeadline("# goodcase"))).toBe("goodcase");
    expect(markdownToString(extractHeadline("## h2"))).toBe(undefined);
    expect(markdownToString(extractHeadline("##nospaceh2"))).toBe(undefined);
  });
});
