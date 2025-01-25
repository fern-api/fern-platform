import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DefinitionObjectFactory } from "@fern-platform/fdr-utils";
import { withSeo } from "../with-seo";

describe("getSeoProps", () => {
  it("seo disabled", () => {
    const props = withSeo(
      "host",
      DefinitionObjectFactory.createDocsDefinition().config,
      undefined,
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
      true
    );
    expect(props.noindex).toBe(true);
    expect(props.nofollow).toBe(true);
  });
});
