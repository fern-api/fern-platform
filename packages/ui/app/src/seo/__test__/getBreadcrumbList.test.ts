import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { getBreadcrumbList } from "../getBreadcrumbList";

describe("getBreadcrumbList", () => {
    it("should override the title used in the breadcrumb's last item", () => {
        const node: FernNavigation.PageNode = {
            id: FernNavigation.NodeId("id"),
            type: "page",
            pageId: FernNavigation.PageId("pageId"),
            title: "Overview",
            slug: FernNavigation.Slug("slug/page"),
            icon: undefined,
            hidden: false,
            noindex: undefined,
            canonicalSlug: undefined,
            authed: undefined,
            viewers: undefined,
            orphaned: undefined,
        };
        const parents: FernNavigation.NavigationNode[] = [
            {
                id: FernNavigation.NodeId("parentsId"),
                type: "section",
                title: "File Uploader",
                slug: FernNavigation.Slug("slug"),
                icon: undefined,
                hidden: false,
                noindex: undefined,
                collapsed: false,
                children: [node],
                overviewPageId: undefined,
                pointsTo: undefined,
                canonicalSlug: undefined,
                authed: undefined,
                viewers: undefined,
                orphaned: undefined,
            },
        ];
        expect(getBreadcrumbList("buildwithfern.com", parents, node, "Overriden Title")).toEqual({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "File Uploader",
                    item: "https://buildwithfern.com/slug",
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: "Overriden Title",
                    item: "https://buildwithfern.com/slug/page",
                },
            ],
        });
    });
});
