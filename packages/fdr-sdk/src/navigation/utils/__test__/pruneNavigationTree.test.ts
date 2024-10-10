import { FernNavigation } from "../../..";
import { Pruner } from "../pruneNavigationTree";

describe("pruneNavigationTree", () => {
    it("should not prune the tree if keep returns true for all nodes", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep(() => true)
            .get();

        // structuredClone should duplicate the object
        expect(result === root).toBe(false);

        expect(result).toStrictEqual({
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
            audience: undefined,
        });
    });

    it("should return undefined if no visitable pages are left", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep((node) => node.id !== FernNavigation.NodeId("page"))
            .get();

        expect(result).toBeUndefined();
    });

    it("should not prune section children even if section itself is pruned", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            overviewPageId: FernNavigation.PageId("overview.mdx"), // this is a visitable page
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep((node) => node.id !== "root")
            .get();

        // structuredClone should duplicate the object
        expect(result === root).toBe(false);

        expect(result).toStrictEqual({
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            overviewPageId: undefined, // this should be deleted
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
            audience: undefined,
        });
    });

    it("should not prune section even if children are pruned", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            overviewPageId: FernNavigation.PageId("overview.mdx"), // this is a visitable page
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep((node) => node.id !== "page")
            .get();

        // structuredClone should duplicate the object
        expect(result === root).toBe(false);

        expect(result).toStrictEqual({
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            overviewPageId: FernNavigation.PageId("overview.mdx"), // this is a visitable page
            title: "Root",
            children: [], // children is empty, but the section is still there because it has an overview page
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        });
    });

    it("should not prune non-leaf nodes", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            overviewPageId: undefined,
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep((node) => node.id !== "root")
            .get();

        // structuredClone should duplicate the object
        expect(result === root).toBe(false);

        expect(result).toStrictEqual({
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            overviewPageId: undefined, // this should be deleted
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
            audience: undefined,
        });
    });

    it("should delete leaf node and its parent if no siblings left", () => {
        const root: FernNavigation.NavigationNode = {
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            title: "Root",
            overviewPageId: undefined,
            children: [
                {
                    type: "section",
                    id: FernNavigation.NodeId("section2"),
                    slug: FernNavigation.Slug("root/section2"),
                    title: "Section 2",
                    overviewPageId: undefined,
                    children: [
                        {
                            type: "page",
                            id: FernNavigation.NodeId("page1"),
                            slug: FernNavigation.Slug("root/section2/page"),
                            title: "Page",
                            pageId: FernNavigation.PageId("page.mdx"),
                            canonicalSlug: undefined,
                            icon: undefined,
                            hidden: undefined,
                            authed: undefined,
                            noindex: undefined,
                            audience: undefined,
                        },
                    ],
                    collapsed: undefined,
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    pointsTo: undefined,
                    audience: undefined,
                },
                {
                    type: "page",
                    id: FernNavigation.NodeId("page2"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
            audience: undefined,
        };

        const result = Pruner.from(root)
            .keep((node) => node.id !== "page1")
            .get();

        // structuredClone should duplicate the object
        expect(result === root).toBe(false);

        expect(result).toStrictEqual({
            type: "section",
            id: FernNavigation.NodeId("root"),
            slug: FernNavigation.Slug("root"),
            overviewPageId: undefined, // this should be deleted
            title: "Root",
            children: [
                {
                    type: "page",
                    id: FernNavigation.NodeId("page2"),
                    slug: FernNavigation.Slug("root/page"),
                    title: "Page",
                    pageId: FernNavigation.PageId("page.mdx"),
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    audience: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            audience: undefined,

            // NOTE: points to is updated!
            pointsTo: "root/page",
        });
    });
});
