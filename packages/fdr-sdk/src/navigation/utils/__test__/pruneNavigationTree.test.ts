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
                    noindex: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
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
                    noindex: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            pointsTo: undefined,
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
                    noindex: undefined,
                },
            ],
            collapsed: undefined,
            canonicalSlug: undefined,
            icon: undefined,
            hidden: undefined,
            overviewPageId: undefined,
            noindex: undefined,
            pointsTo: undefined,
        };

        const result = pruneNavigationTree(root, (node) => node.id !== FernNavigation.NodeId("page"));

        expect(result).toBeUndefined();
    });
});
