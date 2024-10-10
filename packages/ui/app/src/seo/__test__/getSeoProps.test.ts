import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { DefinitionObjectFactory } from "@fern-ui/fdr-utils";
import { extractHeadline, getSeoProps, stripMarkdown } from "../getSeoProp";

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
                    audience: undefined,
                },
                parents: [],
                currentVersion: undefined,
                root: { slug: FernNavigation.Slug("") } as FernNavigation.RootNode,
            },
            true,
            false,
        );
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(true);
    });

    it("extracts SEO title properly", () => {
        expect(stripMarkdown(extractHeadline("#"))).toBe("");
        expect(stripMarkdown(extractHeadline("# goodcase"))).toBe("goodcase");
        expect(stripMarkdown(extractHeadline("## h2"))).toBe(undefined);
        expect(stripMarkdown(extractHeadline("##nospaceh2"))).toBe(undefined);
    });
});
