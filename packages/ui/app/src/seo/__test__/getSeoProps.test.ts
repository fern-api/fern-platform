import { FernNavigation } from "@fern-api/fdr-sdk";
import { extractHeadline, getSeoProps, stripMarkdown } from "../getSeoProp";

describe("getSeoProps", () => {
    it("seo disabled", () => {
        const props = getSeoProps({
            domain: "https://plantstore.dev",
            siteName: "Plant Store",
            metadata: undefined,
            favicon: undefined,
            typography: undefined,
            pages: {},
            files: {},
            apis: {},
            isSeoDisabled: true,
            isTrailingSlashEnabled: false,
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
            },
            parents: [],
            version: undefined,
        });
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(true);
    });

    it("seo enabled on hidden page", () => {
        const props = getSeoProps({
            domain: "https://plantstore.dev",
            siteName: "Plant Store",
            metadata: undefined,
            favicon: undefined,
            typography: undefined,
            pages: {},
            files: {},
            apis: {},
            isSeoDisabled: false,
            isTrailingSlashEnabled: false,
            node: {
                id: FernNavigation.NodeId("id"),
                type: "page",
                pageId: FernNavigation.PageId("pageId"),
                title: "page",
                slug: FernNavigation.Slug("slug"),
                canonicalSlug: undefined,
                icon: undefined,
                hidden: true,
                noindex: undefined,
            },
            parents: [],
            version: undefined,
        });
        expect(props.noindex).toBe(false);
        expect(props.nofollow).toBe(false);
    });

    it("seo disabled on hidden page with noindex=true", () => {
        const props = getSeoProps({
            domain: "https://plantstore.dev",
            siteName: "Plant Store",
            metadata: undefined,
            favicon: undefined,
            typography: undefined,
            pages: {},
            files: {},
            apis: {},
            isSeoDisabled: false,
            isTrailingSlashEnabled: false,
            node: {
                id: FernNavigation.NodeId("id"),
                type: "page",
                pageId: FernNavigation.PageId("pageId"),
                title: "page",
                slug: FernNavigation.Slug("slug"),
                canonicalSlug: undefined,
                icon: undefined,
                hidden: true,
                noindex: true,
            },
            parents: [],
            version: undefined,
        });
        expect(props.noindex).toBe(true);
        expect(props.nofollow).toBe(false);
    });

    it("extracts SEO title properly", () => {
        expect(stripMarkdown(extractHeadline("#"))).toBe("");
        expect(stripMarkdown(extractHeadline("# goodcase"))).toBe("goodcase");
        expect(stripMarkdown(extractHeadline("## h2"))).toBe(undefined);
        expect(stripMarkdown(extractHeadline("##nospaceh2"))).toBe(undefined);
    });
});
