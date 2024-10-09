import { FernNavigation } from "../../..";
import { pruneNavigationTree } from "../pruneNavigationTree";

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
        };

        const result = pruneNavigationTree(root, () => true);

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
        };

        const result = pruneNavigationTree(root, (node) => node.id !== FernNavigation.NodeId("page"));

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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
        };

        const result = pruneNavigationTree(root, (node) => node.id !== "root");

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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
        };

        const result = pruneNavigationTree(root, (node) => node.id !== "page");

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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
        };

        const result = pruneNavigationTree(root, (node) => node.id !== "root");

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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: FernNavigation.Slug("root/page"),
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
                        },
                    ],
                    collapsed: undefined,
                    canonicalSlug: undefined,
                    icon: undefined,
                    hidden: undefined,
                    authed: undefined,
                    noindex: undefined,
                    pointsTo: undefined,
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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,
            pointsTo: undefined,
        };

        const result = pruneNavigationTree(root, (node) => node.id !== "page1");

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
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            authed: undefined,
            noindex: undefined,

            // NOTE: points to is updated!
            pointsTo: "root/page",
        });
    });
});
