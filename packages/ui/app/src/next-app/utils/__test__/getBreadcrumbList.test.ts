import { FernNavigation } from "@fern-api/fdr-sdk";
import { getBreadcrumbList } from "../getBreadcrumbList";

describe("getBreadcrumbList", () => {
    it("should override the title used in the breadcrumb's last item", () => {
        expect(
            getBreadcrumbList(
                "buildwithfern.com",
                {
                    [FernNavigation.PageId("pageId")]: {
                        markdown: `
---
title: Overriden Title
---

## This is a markdown file
`,
                    },
                },
                [
                    {
                        id: FernNavigation.NodeId("id"),
                        type: "section",
                        title: "File Uploader",
                        slug: FernNavigation.Slug("slug"),
                        icon: undefined,
                        hidden: false,
                        noindex: undefined,
                        collapsed: false,
                        children: [],
                        overviewPageId: undefined,
                        pointsTo: undefined,
                    },
                ],
                {
                    id: FernNavigation.NodeId("id"),
                    type: "page",
                    pageId: FernNavigation.PageId("pageId"),
                    title: "Overview",
                    slug: FernNavigation.Slug("slug/page"),
                    icon: undefined,
                    hidden: false,
                    noindex: undefined,
                },
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
