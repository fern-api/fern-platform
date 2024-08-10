import * as FernNavigation from "@fern-api/fdr-sdk/navigation";
import { getBreadcrumbList } from "../getBreadcrumbList";

describe("getBreadcrumbList", () => {
    it("should override the title used in the breadcrumb's last item", () => {
        const markdown = `
---
title: Overriden Title
---

## This is a markdown file
`;

        const node: FernNavigation.PageNode = {
            id: FernNavigation.NodeId("id"),
            type: "page",
            pageId: FernNavigation.PageId("pageId"),
            title: "Overview",
            slug: FernNavigation.Slug("slug/page"),
            icon: undefined,
            hidden: false,
            noindex: undefined,
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
            },
        ];
        expect(
            getBreadcrumbList(
                "buildwithfern.com",
                {
                    [node.pageId]: { markdown },
                },
                parents,
                node,
            ),
        ).toEqual({
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
